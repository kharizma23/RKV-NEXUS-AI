import uuid
import asyncio
from datetime import datetime, UTC, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.model import Notification, NotificationRead
from app.modules.users.model import User, StudentProfile
from app.modules.academics.model import Subject, SubjectEnrolment
from app.modules.personalized_learning.model import StudentKnowledgeState
from app.modules.evaluation.model import EvaluationResult
from app.modules.assessment_attempts.model import StudentExamAttempt

class SSEBroadcaster:
    def __init__(self):
        # Map user_id -> Set[asyncio.Queue]
        self._connections: dict[uuid.UUID, set] = {}

    async def subscribe(self, user_id: uuid.UUID) -> asyncio.Queue[Any]:
        queue: asyncio.Queue[Any] = asyncio.Queue()
        if user_id not in self._connections:
            self._connections[user_id] = set()
        self._connections[user_id].add(queue)
        return queue

    def unsubscribe(self, user_id: uuid.UUID, queue: asyncio.Queue):
        if user_id in self._connections:
            self._connections[user_id].discard(queue)
            if not self._connections[user_id]:
                del self._connections[user_id]

    async def broadcast_to_user(self, user_id: uuid.UUID, data: dict[str, Any]):
        if user_id in self._connections:
            for queue in self._connections[user_id]:
                await queue.put(data)

    async def broadcast_to_users(self, user_ids: list[uuid.UUID], data: dict[str, Any]):
        for user_id in user_ids:
            await self.broadcast_to_user(user_id, data)

    async def broadcast_global(self, data: dict[str, Any]):
        for user_id in list(self._connections.keys()):
            await self.broadcast_to_user(user_id, data)

# Global broadcaster instance
broadcaster = SSEBroadcaster()

class NotificationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = NotificationRepository(session)

    async def broadcast_notification(
        self,
        title: str,
        message: str,
        category: str,
        priority: str,
        sender_type: str,
        sender_id: Optional[uuid.UUID],
        recipient_type: str,
        recipient_id: Optional[uuid.UUID] = None,
        institution_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        programme_id: Optional[uuid.UUID] = None,
        semester_id: Optional[uuid.UUID] = None,
        subject_id: Optional[uuid.UUID] = None,
        scheduled_at: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        created_by: Optional[uuid.UUID] = None,
        attachments: Optional[list[dict[str, str]]] = None
    ) -> Notification:
        # 1. Create in PostgreSQL
        notif = await self.repo.create_notification(
            title=title,
            message=message,
            category=category,
            priority=priority,
            sender_type=sender_type,
            sender_id=sender_id,
            recipient_type=recipient_type,
            recipient_id=recipient_id,
            institution_id=institution_id,
            department_id=department_id,
            programme_id=programme_id,
            semester_id=semester_id,
            subject_id=subject_id,
            scheduled_at=scheduled_at,
            expires_at=expires_at,
            created_by=created_by,
            attachments=attachments
        )

        # 2. Trigger Real-Time SSE delivery if active
        now = datetime.now(UTC)
        is_immediate = not scheduled_at or scheduled_at <= now
        if is_immediate and notif.is_active:
            payload = {
                "id": str(notif.id),
                "title": notif.title,
                "message": notif.message,
                "category": notif.category,
                "priority": notif.priority,
                "sender_type": notif.sender_type,
                "created_at": notif.created_at.isoformat(),
                "attachments": [{"id": str(a.id), "file_name": a.file_name, "file_url": a.file_url} for a in notif.attachments]
            }

            # Identify target users to push to
            if recipient_type == "INDIVIDUAL" and recipient_id:
                await broadcaster.broadcast_to_user(recipient_id, payload)
            elif recipient_type == "ALL":
                await broadcaster.broadcast_global(payload)
            else:
                # Find matching students in DB and push to them
                target_ids = await self._get_matching_student_user_ids(notif)
                await broadcaster.broadcast_to_users(target_ids, payload)

        return notif

    async def _get_matching_student_user_ids(self, notif: Notification) -> list[uuid.UUID]:
        stmt = select(User.id).join(StudentProfile, User.id == StudentProfile.user_id)
        if notif.institution_id:
            stmt = stmt.where(StudentProfile.institution_id == notif.institution_id)
        if notif.department_id:
            stmt = stmt.where(StudentProfile.department_id == notif.department_id)
        if notif.programme_id:
            stmt = stmt.where(StudentProfile.programme_id == notif.programme_id)
        if notif.semester_id:
            stmt = stmt.where(StudentProfile.semester_id == notif.semester_id)
        if notif.subject_id:
            stmt = stmt.join(SubjectEnrolment, StudentProfile.id == SubjectEnrolment.student_id).where(SubjectEnrolment.subject_id == notif.subject_id)
        
        res = await self.session.execute(stmt)
        return [row[0] for row in res.all()]

    async def run_ai_risk_detection_and_recommender(self, student_user_id: uuid.UUID) -> list[Notification]:
        """
        AI smart analyzer: checks student knowledge states from real DB and generates
        personalized notifications for weak topics and study inactivity.
        Note: Attendance data is not tracked in this system — attendance-based alerts are omitted.
        """
        prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student_user_id)
        prof_res = await self.session.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        new_notifications: list[Notification] = []
        if not profile:
            return new_notifications

        # 1. Check StudentKnowledgeState for WEAK topics — generate targeted remedial alerts
        states_stmt = select(StudentKnowledgeState).where(
            StudentKnowledgeState.student_id == profile.id,
            StudentKnowledgeState.status == "WEAK"
        )
        states_res = await self.session.execute(states_stmt)
        weak_states = states_res.scalars().all()

        for state in weak_states[:3]:  # Limit to 3 alerts to avoid spam
            topic_name = state.topic.title if state.topic else f"Topic {state.topic_id}"
            mastery_pct = round(state.mastery_level * 100)
            title = f"⚠ Weak Topic Alert: {topic_name}"
            msg = (f"Your mastery level for '{topic_name}' is currently {mastery_pct}%. "
                   f"Review your study materials and practice questions to strengthen this topic "
                   f"before your next examination.")
            notif = await self.repo.create_notification(
                title=title, message=msg, category="LEARNING_PLAN", priority="HIGH",
                sender_type="SYSTEM", sender_id=None,
                recipient_type="INDIVIDUAL", recipient_id=student_user_id
            )
            new_notifications.append(notif)
            await broadcaster.broadcast_to_user(student_user_id, {
                "id": str(notif.id), "title": title, "message": msg,
                "category": "LEARNING_PLAN", "priority": "HIGH",
                "created_at": datetime.now(UTC).isoformat()
            })

        # 2. Check exam results — if any result is < 50%, send low-score warning
        results_stmt = (
            select(EvaluationResult)
            .join(StudentExamAttempt, EvaluationResult.attempt_id == StudentExamAttempt.id)
            .where(
                StudentExamAttempt.student_id == profile.id,
                EvaluationResult.status == "PUBLISHED",
                EvaluationResult.percentage < 50.0
            )
        )
        results_res = await self.session.execute(results_stmt)
        low_results = results_res.scalars().all()

        for result in low_results[:2]:  # Limit to 2 alerts
            exam_title = result.attempt.examination.title if (result.attempt and result.attempt.examination) else "Recent Exam"
            title = f"📊 Low Score Alert: {exam_title}"
            msg = (f"You scored {result.percentage:.1f}% in {exam_title}. "
                   f"Please review the exam feedback in your Results section and "
                   f"follow the recommended remedial study path to improve.")
            notif = await self.repo.create_notification(
                title=title, message=msg, category="RESULTS", priority="HIGH",
                sender_type="SYSTEM", sender_id=None,
                recipient_type="INDIVIDUAL", recipient_id=student_user_id
            )
            new_notifications.append(notif)
            await broadcaster.broadcast_to_user(student_user_id, {
                "id": str(notif.id), "title": title, "message": msg,
                "category": "RESULTS", "priority": "HIGH",
                "created_at": datetime.now(UTC).isoformat()
            })

        # 3. Motivational message if student has good mastery overall
        good_states_stmt = select(func.count()).select_from(StudentKnowledgeState).where(
            StudentKnowledgeState.student_id == profile.id,
            StudentKnowledgeState.status == "MASTERED"
        )
        good_res = await self.session.execute(good_states_stmt)
        mastered_count = good_res.scalar() or 0

        if mastered_count >= 3 and len(weak_states) == 0:
            title = "🏆 Excellent Progress! All Topics Mastered"
            msg = (f"Outstanding academic performance! You have mastered {mastered_count} topics. "
                   f"Keep up the great momentum and stay consistent with your study schedule.")
            notif = await self.repo.create_notification(
                title=title, message=msg, category="LEARNING_PLAN", priority="LOW",
                sender_type="SYSTEM", sender_id=None,
                recipient_type="INDIVIDUAL", recipient_id=student_user_id
            )
            new_notifications.append(notif)
            await broadcaster.broadcast_to_user(student_user_id, {
                "id": str(notif.id), "title": title, "message": msg,
                "category": "LEARNING_PLAN", "priority": "LOW",
                "created_at": datetime.now(UTC).isoformat()
            })

        return new_notifications

    async def get_daily_ai_summary(self, student_user_id: uuid.UUID) -> dict[str, Any]:
        """
        Generates a summary of today's learning state from real database records.
        Uses actual knowledge states, published results, and upcoming exam notifications.
        """
        # Fetch student profile
        prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student_user_id)
        prof_res = await self.session.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        weak_topics: list[str] = []
        recommended_practice: list[str] = []
        upcoming_deadlines: list[dict[str, Any]] = []
        exam_readiness = 0
        hours_studied = 0.0
        assignments_completed = 0

        if profile:
            # 1. Get real weak topics from StudentKnowledgeState
            weak_stmt = (
                select(StudentKnowledgeState)
                .where(
                    StudentKnowledgeState.student_id == profile.id,
                    StudentKnowledgeState.status == "WEAK"
                )
            )
            weak_res = await self.session.execute(weak_stmt)
            weak_states = weak_res.scalars().all()

            for state in weak_states[:3]:
                topic_name = state.topic.title if state.topic else f"Topic {state.topic_id}"
                weak_topics.append(topic_name)
                recommended_practice.append(f"Practice 5 questions on {topic_name}")

            # 2. Get real exam readiness from latest evaluation results
            results_stmt = (
                select(EvaluationResult)
                .join(StudentExamAttempt, EvaluationResult.attempt_id == StudentExamAttempt.id)
                .where(
                    StudentExamAttempt.student_id == profile.id,
                    EvaluationResult.status == "PUBLISHED"
                )
                .order_by(EvaluationResult.evaluated_at.desc())
                .limit(5)
            )
            results_res = await self.session.execute(results_stmt)
            recent_results = results_res.scalars().all()

            if recent_results:
                avg_pct = sum(r.percentage for r in recent_results) / len(recent_results)
                exam_readiness = round(avg_pct)
                assignments_completed = len(recent_results)
            else:
                exam_readiness = 0
                assignments_completed = 0

            # 3. Get upcoming exam deadlines from EXAMINATION-category unread notifications
            deadline_stmt = (
                select(Notification)
                .outerjoin(
                    NotificationRead,
                    and_(
                        NotificationRead.notification_id == Notification.id,
                        NotificationRead.student_id == student_user_id
                    )
                )
                .where(
                    or_(Notification.recipient_id == student_user_id, Notification.recipient_type == "ALL"),
                    Notification.category == "EXAMINATION",
                    NotificationRead.id == None,
                    Notification.is_active == True
                )
                .order_by(Notification.created_at.desc())
                .limit(3)
            )
            deadline_res = await self.session.execute(deadline_stmt)
            exam_notifs = deadline_res.scalars().all()

            for notif in exam_notifs:
                upcoming_deadlines.append({
                    "title": notif.title,
                    "due_at": datetime.now(UTC) + timedelta(days=7),  # Approximate
                    "days_left": 7
                })

            # Estimate hours studied from knowledge state count (proxy)
            all_states_stmt = select(func.count()).select_from(StudentKnowledgeState).where(
                StudentKnowledgeState.student_id == profile.id
            )
            count_res = await self.session.execute(all_states_stmt)
            topic_count = count_res.scalar() or 0
            # Rough estimate: each topic tracked implies ~0.5 hours of study
            hours_studied = round(min(8.0, topic_count * 0.5), 1)

        # If no recommendations generated, add a generic helpful one
        if not recommended_practice:
            recommended_practice = [
                "Review your course materials and attempt practice questions",
                "Take a practice quiz to identify knowledge gaps"
            ]
        if not weak_topics:
            weak_topics = ["No weak topics identified — great work!"]

        return {
            "assignments_completed": assignments_completed,
            "hours_studied": hours_studied,
            "exam_readiness": exam_readiness,
            "weak_topics": weak_topics[:2],
            "recommended_practice": recommended_practice[:2],
            "upcoming_deadlines": upcoming_deadlines
        }
