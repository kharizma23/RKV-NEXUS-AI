import uuid
from datetime import datetime, UTC, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.gamification.model import StudentPoints, Badge, StudentBadge, StudentPointHistory
from app.modules.users.model import User, StudentProfile
from app.modules.institutions.model import Department
from app.modules.evaluation.model import EvaluationResult
from app.modules.assessment_attempts.model import StudentExamAttempt

DEFAULT_BADGES = [
    {"name": "First Exam", "description": "Completed your first exam", "icon": "🎯", "criteria": {"type": "exam_count", "value": 1}},
    {"name": "Perfect Score", "description": "Scored 100% in an exam", "icon": "💯", "criteria": {"type": "score", "value": 100}},
    {"name": "CO Master", "description": "Achieved 80%+ in all COs", "icon": "🧠", "criteria": {"type": "co_attainment", "value": 80}},
    {"name": "Streak 7", "description": "7-day study streak", "icon": "🔥", "criteria": {"type": "streak", "value": 7}},
    {"name": "Streak 30", "description": "30-day study streak", "icon": "⚡", "criteria": {"type": "streak", "value": 30}},
    {"name": "Top Performer", "description": "Ranked #1 in department", "icon": "🏆", "criteria": {"type": "rank", "value": 1}},
    {"name": "Fast Learner", "description": "Completed 5 exams in a week", "icon": "🚀", "criteria": {"type": "exam_week", "value": 5}},
    {"name": "AI Explorer", "description": "Used AI recommendations 10 times", "icon": "🤖", "criteria": {"type": "ai_usage", "value": 10}}
]

class GamificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_badges_seeded(self):
        stmt = select(func.count(Badge.id))
        count = (await self.db.execute(stmt)).scalar() or 0
        if count == 0:
            for b in DEFAULT_BADGES:
                badge = Badge(
                    name=b["name"],
                    description=b["description"],
                    icon=b["icon"],
                    criteria=b["criteria"]
                )
                self.db.add(badge)
            await self.db.flush()

    async def get_or_create_student_points(self, student_id: uuid.UUID) -> StudentPoints:
        stmt = select(StudentPoints).where(StudentPoints.student_id == student_id)
        res = await self.db.execute(stmt)
        sp = res.scalar_one_or_none()
        if not sp:
            sp = StudentPoints(
                student_id=student_id,
                points=0,
                total_points=0,
                streak_days=1,
                last_activity_date=datetime.now(UTC)
            )
            self.db.add(sp)
            await self.db.flush()
        return sp

    async def record_daily_activity(self, student_id: uuid.UUID) -> StudentPoints:
        sp = await self.get_or_create_student_points(student_id)
        now = datetime.now(UTC)
        if sp.last_activity_date:
            diff_days = (now.date() - sp.last_activity_date.date()).days
            if diff_days == 1:
                sp.streak_days += 1
                # Daily login points
                await self.award_points(student_id, 5, "Daily Login Streak")
                if sp.streak_days == 7:
                    await self.award_points(student_id, 50, "7-Day Streak Bonus")
                elif sp.streak_days == 30:
                    await self.award_points(student_id, 200, "30-Day Streak Bonus")
            elif diff_days > 1:
                sp.streak_days = 1
                await self.award_points(student_id, 5, "Daily Activity Reset")
        else:
            sp.streak_days = 1
            await self.award_points(student_id, 5, "Initial Activity")
            
        sp.last_activity_date = now
        await self.db.flush()
        return sp

    async def award_points(self, student_id: uuid.UUID, points: int, reason: str) -> StudentPoints:
        sp = await self.get_or_create_student_points(student_id)
        sp.points += points
        sp.total_points += points

        history = StudentPointHistory(
            student_id=student_id,
            points_awarded=points,
            reason=reason
        )
        self.db.add(history)
        await self.db.flush()

        # Check badges after awarding points
        await self.check_and_award_badges(student_id)
        return sp

    async def check_and_award_badges(self, student_id: uuid.UUID) -> List[Badge]:
        await self.ensure_badges_seeded()
        sp = await self.get_or_create_student_points(student_id)

        # Get already earned badge IDs
        earned_res = await self.db.execute(
            select(StudentBadge.badge_id).where(StudentBadge.student_id == student_id)
        )
        earned_badge_ids = set(earned_res.scalars().all())

        # Fetch all available badges
        all_badges_res = await self.db.execute(select(Badge))
        all_badges = list(all_badges_res.scalars().all())

        # Count completed exams and max score
        exams_stmt = select(func.count(EvaluationResult.id)).join(
            StudentExamAttempt, EvaluationResult.attempt_id == StudentExamAttempt.id
        ).where(StudentExamAttempt.student_id == student_id)
        exam_count = (await self.db.execute(exams_stmt)).scalar() or 0

        max_score_stmt = select(func.max(EvaluationResult.percentage)).join(
            StudentExamAttempt, EvaluationResult.attempt_id == StudentExamAttempt.id
        ).where(StudentExamAttempt.student_id == student_id)
        max_score = (await self.db.execute(max_score_stmt)).scalar() or 0.0

        newly_awarded = []
        for badge in all_badges:
            if badge.id in earned_badge_ids:
                continue

            criteria = badge.criteria or {}
            c_type = criteria.get("type")
            c_val = criteria.get("value", 0)

            earned = False
            if c_type == "exam_count" and exam_count >= c_val:
                earned = True
            elif c_type == "score" and max_score >= c_val:
                earned = True
            elif c_type == "streak" and sp.streak_days >= c_val:
                earned = True
            elif c_type == "co_attainment" and max_score >= 80.0:
                earned = True
            elif c_type == "rank" and sp.total_points >= 200:
                earned = True
            elif c_type == "exam_week" and exam_count >= c_val:
                earned = True
            elif c_type == "ai_usage" and sp.points >= 50:
                earned = True

            if earned:
                sb = StudentBadge(student_id=student_id, badge_id=badge.id)
                self.db.add(sb)
                newly_awarded.append(badge)

        if newly_awarded:
            await self.db.flush()

        return newly_awarded

    async def get_student_points_summary(self, student_id: uuid.UUID) -> Dict[str, Any]:
        sp = await self.get_or_create_student_points(student_id)
        
        # Recent points history
        hist_stmt = select(StudentPointHistory).where(
            StudentPointHistory.student_id == student_id
        ).order_by(StudentPointHistory.created_at.desc()).limit(10)
        hist_res = await self.db.execute(hist_stmt)
        history = [
            {
                "id": str(h.id),
                "points": h.points_awarded,
                "reason": h.reason,
                "created_at": h.created_at.isoformat()
            }
            for h in hist_res.scalars().all()
        ]

        # Count badges
        badge_count_stmt = select(func.count(StudentBadge.id)).where(StudentBadge.student_id == student_id)
        badge_count = (await self.db.execute(badge_count_stmt)).scalar() or 0

        return {
            "student_id": str(student_id),
            "points": sp.points,
            "total_points": sp.total_points,
            "streak_days": sp.streak_days,
            "badge_count": badge_count,
            "last_activity": sp.last_activity_date.isoformat() if sp.last_activity_date else None,
            "history": history
        }

    async def get_student_badges(self, student_id: uuid.UUID) -> Dict[str, Any]:
        await self.ensure_badges_seeded()
        all_badges_res = await self.db.execute(select(Badge))
        all_badges = list(all_badges_res.scalars().all())

        earned_stmt = select(StudentBadge).options(selectinload(StudentBadge.badge)).where(
            StudentBadge.student_id == student_id
        )
        earned_res = await self.db.execute(earned_stmt)
        earned_map = {sb.badge_id: sb.earned_at for sb in earned_res.scalars().all()}

        badges_output = []
        for b in all_badges:
            is_earned = b.id in earned_map
            badges_output.append({
                "id": str(b.id),
                "name": b.name,
                "description": b.description,
                "icon": b.icon,
                "is_earned": is_earned,
                "earned_at": earned_map[b.id].isoformat() if is_earned else None
            })

        return {
            "total_badges": len(all_badges),
            "earned_count": len(earned_map),
            "badges": badges_output
        }

    async def get_leaderboard(self, department_name: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        stmt = (
            select(
                User.id,
                User.full_name,
                StudentPoints.total_points,
                StudentPoints.streak_days,
                func.count(StudentBadge.id).label("badge_count")
            )
            .join(StudentPoints, User.id == StudentPoints.student_id)
            .outerjoin(StudentBadge, User.id == StudentBadge.student_id)
            .group_by(User.id, User.full_name, StudentPoints.total_points, StudentPoints.streak_days)
            .order_by(StudentPoints.total_points.desc())
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        rows = res.all()

        leaderboard = []
        for rank, row in enumerate(rows, start=1):
            leaderboard.append({
                "rank": rank,
                "user_id": str(row.id),
                "full_name": row.full_name,
                "department": department_name or "Computer Science and Engineering",
                "total_points": row.total_points,
                "streak_days": row.streak_days,
                "badge_count": row.badge_count
            })
        return leaderboard
