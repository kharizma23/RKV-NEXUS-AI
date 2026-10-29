import uuid
from datetime import datetime, UTC, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import select, update, delete, or_, and_, func, desc
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.notifications.model import Notification, NotificationRead, NotificationSetting, NotificationAttachment
from app.modules.users.model import User, StudentProfile, FacultyProfile
from app.modules.roles.model import Role
from app.modules.academics.model import SubjectEnrolment, Subject

class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_settings(self, user_id: uuid.UUID) -> NotificationSetting:
        stmt = select(NotificationSetting).where(NotificationSetting.user_id == user_id)
        res = await self.session.execute(stmt)
        settings = res.scalar_one_or_none()
        if not settings:
            settings = NotificationSetting(
                user_id=user_id,
                exam_notifications=True,
                result_notifications=True,
                assignment_notifications=True,
                faculty_notifications=True,
                learning_notifications=True,
                placement_notifications=True,
                announcement_notifications=True,
                email_notifications=True,
                browser_notifications=True
            )
            self.session.add(settings)
            await self.session.flush()
        return settings

    async def update_settings(self, user_id: uuid.UUID, updates: dict[str, Any]) -> NotificationSetting:
        settings = await self.get_or_create_settings(user_id)
        for key, val in updates.items():
            if val is not None and hasattr(settings, key):
                setattr(settings, key, val)
        await self.session.flush()
        return settings

    async def create_notification(
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
        notif = Notification(
            title=title,
            message=message,
            category=category.upper(),
            priority=priority.upper(),
            sender_type=sender_type.upper(),
            sender_id=sender_id,
            recipient_type=recipient_type.upper(),
            recipient_id=recipient_id,
            institution_id=institution_id,
            department_id=department_id,
            programme_id=programme_id,
            semester_id=semester_id,
            subject_id=subject_id,
            scheduled_at=scheduled_at,
            expires_at=expires_at,
            created_by=created_by,
            is_active=True
        )
        self.session.add(notif)
        await self.session.flush()

        if attachments:
            for att in attachments:
                attachment = NotificationAttachment(
                    notification_id=notif.id,
                    file_name=att["file_name"],
                    file_url=att["file_url"]
                )
                self.session.add(attachment)
            await self.session.flush()

        # Reload with attachments
        stmt = select(Notification).options(
            selectinload(Notification.attachments),
            selectinload(Notification.sender)
        ).where(Notification.id == notif.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def get_student_notifications(
        self,
        student_id: uuid.UUID,
        filters: Optional[dict[str, Any]] = None
    ) -> list[Notification]:
        filters = filters or {}
        
        # 1. Fetch student profile
        prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student_id)
        prof_res = await self.session.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        # Get subject enrolments if profile exists
        enrolled_subject_ids = []
        if profile:
            enr_stmt = select(SubjectEnrolment.subject_id).where(SubjectEnrolment.student_id == profile.id)
            enr_res = await self.session.execute(enr_stmt)
            enrolled_subject_ids = [row[0] for row in enr_res.all()]

        # 2. Get student settings
        settings = await self.get_or_create_settings(student_id)
        disabled_categories = []
        if not settings.exam_notifications:
            disabled_categories.append("EXAMINATION")
        if not settings.result_notifications:
            disabled_categories.append("RESULTS")
        if not settings.assignment_notifications:
            disabled_categories.append("ASSIGNMENT")
        if not settings.faculty_notifications:
            disabled_categories.append("FACULTY")
        if not settings.learning_notifications:
            disabled_categories.append("LEARNING_PLAN")
        if not settings.announcement_notifications:
            disabled_categories.append("ANNOUNCEMENT")

        # 3. Base Query
        now = datetime.now(UTC)
        stmt = (
            select(Notification)
            .outerjoin(
                NotificationRead,
                and_(
                    NotificationRead.notification_id == Notification.id,
                    NotificationRead.student_id == student_id
                )
            )
            .options(
                selectinload(Notification.attachments),
                selectinload(Notification.sender)
            )
        )

        # Filters on time & active status
        conditions = [
            Notification.is_active == True,
            or_(Notification.scheduled_at == None, Notification.scheduled_at <= now),
            or_(Notification.expires_at == None, Notification.expires_at >= now)
        ]

        if disabled_categories:
            conditions.append(Notification.category.notin_(disabled_categories))

        # Target conditions matching student metadata
        target_conditions = [
            Notification.recipient_type == "ALL",
            Notification.recipient_id == student_id,
            and_(Notification.recipient_type == "ROLE", Notification.recipient_id == None)  # Or roles
        ]

        if profile:
            if profile.institution_id:
                target_conditions.append(and_(Notification.recipient_type == "INSTITUTION", Notification.institution_id == profile.institution_id))
            if profile.department_id:
                target_conditions.append(and_(Notification.recipient_type == "DEPARTMENT", Notification.department_id == profile.department_id))
            if profile.programme_id:
                target_conditions.append(and_(Notification.recipient_type == "PROGRAMME", Notification.programme_id == profile.programme_id))
            if profile.semester_id:
                target_conditions.append(and_(Notification.recipient_type == "SEMESTER", Notification.semester_id == profile.semester_id))
            if enrolled_subject_ids:
                target_conditions.append(and_(Notification.recipient_type == "SUBJECT", Notification.subject_id.in_(enrolled_subject_ids)))

        conditions.append(or_(*target_conditions))

        # Filter out physically or soft-deleted notifications for student
        conditions.append(or_(NotificationRead.is_deleted == None, NotificationRead.is_deleted == False))

        # Apply frontend filters
        read_filter = filters.get("read")
        if read_filter == "read":
            conditions.append(NotificationRead.id != None)
        elif read_filter == "unread":
            conditions.append(NotificationRead.id == None)
        elif read_filter == "important":
            conditions.append(NotificationRead.is_starred == True)
        
        archive_filter = filters.get("archive")
        if archive_filter == "archived":
            conditions.append(NotificationRead.is_archived == True)
        else:
            # By default exclude archived unless requested
            conditions.append(or_(NotificationRead.is_archived == None, NotificationRead.is_archived == False))

        category_filter = filters.get("category")
        if category_filter and category_filter != "ALL":
            conditions.append(Notification.category == category_filter.upper())

        priority_filter = filters.get("priority")
        if priority_filter and priority_filter != "ALL":
            conditions.append(Notification.priority == priority_filter.upper())

        # Date Filters (Today, Yesterday, Last 7 Days, Last 30 Days)
        date_filter = filters.get("date_filter")
        if date_filter:
            now_local = datetime.now(UTC)
            if date_filter == "today":
                start_of_today = datetime(now_local.year, now_local.month, now_local.day, tzinfo=UTC)
                conditions.append(Notification.created_at >= start_of_today)
            elif date_filter == "yesterday":
                start_of_yesterday = datetime(now_local.year, now_local.month, now_local.day, tzinfo=UTC) - timedelta(days=1)
                end_of_yesterday = datetime(now_local.year, now_local.month, now_local.day, tzinfo=UTC)
                conditions.append(and_(Notification.created_at >= start_of_yesterday, Notification.created_at < end_of_yesterday))
            elif date_filter == "last_7_days":
                conditions.append(Notification.created_at >= now_local - timedelta(days=7))
            elif date_filter == "last_30_days":
                conditions.append(Notification.created_at >= now_local - timedelta(days=30))

        # Join Sender & Subject for searching
        search_query = filters.get("search")
        if search_query:
            # Subquery to join Subject name and Sender full_name
            stmt = stmt.outerjoin(Subject, Notification.subject_id == Subject.id)
            stmt = stmt.outerjoin(User, Notification.sender_id == User.id)
            conditions.append(or_(
                Notification.title.ilike(f"%{search_query}%"),
                Notification.message.ilike(f"%{search_query}%"),
                Subject.name.ilike(f"%{search_query}%"),
                User.full_name.ilike(f"%{search_query}%")
            ))

        # Order by: Pinned first, then newest created_at
        stmt = stmt.where(and_(*conditions)).order_by(
            desc(func.coalesce(NotificationRead.is_pinned, False)),
            desc(Notification.created_at)
        )
        
        res = await self.session.execute(stmt)
        notifications = list(res.scalars().all())

        if not notifications:
            await self.seed_demo_notifications(student_id)
            res = await self.session.execute(stmt)
            notifications = list(res.scalars().all())

        # Annotate notifications with is_read, is_archived, is_starred, is_pinned status for student view
        reads_stmt = select(NotificationRead).where(NotificationRead.student_id == student_id)
        reads_res = await self.session.execute(reads_stmt)
        reads_map = {r.notification_id: r for r in reads_res.scalars().all()}

        for n in notifications:
            read_obj = reads_map.get(n.id)
            n.is_read = read_obj is not None
            n.is_archived = read_obj.is_archived if read_obj else False
            n.is_starred = read_obj.is_starred if read_obj else False
            n.is_pinned = read_obj.is_pinned if read_obj else False

        return notifications

    async def toggle_star(self, student_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
        stmt = select(NotificationRead).where(
            and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == student_id)
        )
        res = await self.session.execute(stmt)
        read_obj = res.scalar_one_or_none()

        if not read_obj:
            read_obj = NotificationRead(
                notification_id=notif_id,
                student_id=student_id,
                read_at=datetime.now(UTC),
                is_starred=True
            )
            self.session.add(read_obj)
        else:
            read_obj.is_starred = not read_obj.is_starred
        await self.session.flush()
        return read_obj.is_starred

    async def toggle_pin(self, student_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
        stmt = select(NotificationRead).where(
            and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == student_id)
        )
        res = await self.session.execute(stmt)
        read_obj = res.scalar_one_or_none()

        if not read_obj:
            read_obj = NotificationRead(
                notification_id=notif_id,
                student_id=student_id,
                read_at=datetime.now(UTC),
                is_pinned=True
            )
            self.session.add(read_obj)
        else:
            read_obj.is_pinned = not read_obj.is_pinned
        await self.session.flush()
        return read_obj.is_pinned

    async def get_created_notifications(
        self,
        creator_id: uuid.UUID,
        role: str
    ) -> list[Notification]:
        # Admin views all notifications/broadcasts across the institution; Faculty views their own
        if role == "ADMIN":
            stmt = (
                select(Notification)
                .options(selectinload(Notification.attachments))
                .order_by(Notification.created_at.desc())
                .limit(50)
            )
        else:
            stmt = (
                select(Notification)
                .options(selectinload(Notification.attachments))
                .where(Notification.created_by == creator_id)
                .order_by(Notification.created_at.desc())
            )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def get_notification_by_id(self, notif_id: uuid.UUID) -> Optional[Notification]:
        stmt = (
            select(Notification)
            .options(
                selectinload(Notification.attachments),
                selectinload(Notification.sender)
            )
            .where(Notification.id == notif_id)
        )
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def mark_as_read(self, student_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
        stmt = select(NotificationRead).where(
            and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == student_id)
        )
        res = await self.session.execute(stmt)
        read_obj = res.scalar_one_or_none()

        if not read_obj:
            read_obj = NotificationRead(
                notification_id=notif_id,
                student_id=student_id,
                read_at=datetime.now(UTC),
                is_archived=False,
                is_deleted=False
            )
            self.session.add(read_obj)
        else:
            # Just ensure read_at is updated if previously marked unread
            pass
        await self.session.flush()
        return True

    async def mark_all_read(self, student_id: uuid.UUID) -> int:
        # Get all unread notifications for this student
        notifications = await self.get_student_notifications(student_id, {"read": "unread"})
        count = 0
        for n in notifications:
            await self.mark_as_read(student_id, n.id)
            count += 1
        return count

    async def archive_notification(self, student_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
        stmt = select(NotificationRead).where(
            and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == student_id)
        )
        res = await self.session.execute(stmt)
        read_obj = res.scalar_one_or_none()

        if not read_obj:
            read_obj = NotificationRead(
                notification_id=notif_id,
                student_id=student_id,
                read_at=datetime.now(UTC),
                is_archived=True,
                is_deleted=False
            )
            self.session.add(read_obj)
        else:
            read_obj.is_archived = True
        await self.session.flush()
        return True

    async def delete_notification_for_student(self, student_id: uuid.UUID, notif_id: uuid.UUID) -> bool:
        stmt = select(NotificationRead).where(
            and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == student_id)
        )
        res = await self.session.execute(stmt)
        read_obj = res.scalar_one_or_none()

        if not read_obj:
            read_obj = NotificationRead(
                notification_id=notif_id,
                student_id=student_id,
                read_at=datetime.now(UTC),
                is_archived=False,
                is_deleted=True
            )
            self.session.add(read_obj)
        else:
            read_obj.is_deleted = True
        await self.session.flush()
        return True

    async def delete_notification_permanently(self, notif_id: uuid.UUID) -> bool:
        # Delete notification completely (Admin/Faculty delete their broadcast)
        stmt = delete(Notification).where(Notification.id == notif_id)
        await self.session.execute(stmt)
        return True

    async def get_notification_analytics(self, notif_id: uuid.UUID) -> dict[str, Any]:
        # 1. Fetch notification details to know target recipient type
        notif = await self.get_notification_by_id(notif_id)
        if not notif:
            return {}

        # 2. Query matching target student count
        # In a real environment, we'd count the users matching recipient criteria:
        student_query = select(User.id).join(Role, User.roles).where(Role.name == "STUDENT")
        
        # Apply targeting
        if notif.recipient_type == "INDIVIDUAL" and notif.recipient_id:
            student_query = student_query.where(User.id == notif.recipient_id)
        elif notif.recipient_type == "INSTITUTION" and notif.institution_id:
            student_query = student_query.join(StudentProfile).where(StudentProfile.institution_id == notif.institution_id)
        elif notif.recipient_type == "DEPARTMENT" and notif.department_id:
            student_query = student_query.join(StudentProfile).where(StudentProfile.department_id == notif.department_id)
        elif notif.recipient_type == "PROGRAMME" and notif.programme_id:
            student_query = student_query.join(StudentProfile).where(StudentProfile.programme_id == notif.programme_id)
        elif notif.recipient_type == "SEMESTER" and notif.semester_id:
            student_query = student_query.join(StudentProfile).where(StudentProfile.semester_id == notif.semester_id)
        elif notif.recipient_type == "SUBJECT" and notif.subject_id:
            student_query = student_query.join(StudentProfile).join(SubjectEnrolment).where(SubjectEnrolment.subject_id == notif.subject_id)

        res_students = await self.session.execute(student_query)
        target_student_ids = [r[0] for r in res_students.all()]
        total_delivered = len(target_student_ids)

        if total_delivered == 0:
            return {
                "delivered_count": 0,
                "read_count": 0,
                "unread_count": 0,
                "read_percentage": 0.0,
                "unread_students": []
            }

        # 3. Query reads among targeted students
        reads_stmt = select(NotificationRead).options(joinedload(NotificationRead.student)).where(
            and_(
                NotificationRead.notification_id == notif_id,
                NotificationRead.student_id.in_(target_student_ids)
            )
        )
        res_reads = await self.session.execute(reads_stmt)
        reads = list(res_reads.scalars().all())
        
        read_student_ids = {r.student_id for r in reads}
        unread_student_ids = [sid for sid in target_student_ids if sid not in read_student_ids]

        # Fetch unread student details
        unread_details: list[User] = []
        if unread_student_ids:
            unr_stmt = select(User).where(User.id.in_(unread_student_ids))
            res_unr = await self.session.execute(unr_stmt)
            unread_details = list(res_unr.scalars().all())

        read_count = len(read_student_ids)
        unread_count = total_delivered - read_count
        read_percentage = (read_count / total_delivered) * 100.0 if total_delivered > 0 else 0.0

        return {
            "delivered_count": total_delivered,
            "read_count": read_count,
            "unread_count": unread_count,
            "read_percentage": round(read_percentage, 2),
            "unread_students": [
                {"id": u.id, "full_name": u.full_name, "email": u.email}
                for u in unread_details
            ]
        }

    async def seed_demo_notifications(self, student_id: uuid.UUID) -> None:
        import random
        from datetime import datetime, UTC, timedelta

        templates = [
            ("Welcome to the Assessment Platform", "Welcome to Apex Institute's AI Assessment Platform. Access subjects to begin learning.", "ANNOUNCEMENT", "LOW"),
            ("Faculty approved your registration", "Your student portal access registration has been officially approved by the department.", "ANNOUNCEMENT", "MEDIUM"),
            ("Mid Semester Examination scheduled", "The Mid-Semester Examination for Database Management Systems is scheduled for 15 Aug 2026.", "EXAMINATION", "HIGH"),
            ("Assignment due tomorrow", "Your Normalization Assignment in DBMS is due tomorrow by 11:59 PM.", "ASSIGNMENT", "HIGH"),
            ("Results published", "Internal assessment results for Digital Communication have been published. Check your grade overview.", "RESULTS", "HIGH"),
            ("AI generated learning plan ready", "A personalized study route has been computed based on your syllabus benchmarks.", "LEARNING_PLAN", "MEDIUM"),
            ("Attendance alert: below 75%", "Your attendance in Signals and Systems has dropped below 75%. Please attend remaining lectures.", "ACADEMIC", "CRITICAL"),
            ("Project review scheduled", "The Capstone Project Milestone 1 evaluation is scheduled for next Monday.", "ACADEMIC", "MEDIUM"),
            ("Viva schedule released", "Digital Logic Design internal viva timings are updated on the department board.", "EXAMINATION", "MEDIUM"),
            ("CO attainment updated", "Course outcome targets (CO-3) for ECE have been evaluated from latest tests.", "ACADEMIC", "LOW"),
            ("Weak topic detected", "AI detected lower mastery in Fourier Transforms. Review Unit 3 resources.", "LEARNING_PLAN", "CRITICAL"),
            ("Placement drive registration open", "The Apex Tech recruitment drive for software engineering interns has opened.", "PLACEMENT", "HIGH"),
            ("Holiday announcement", "The college will remain closed tomorrow due to regional celebrations.", "ANNOUNCEMENT", "LOW"),
            ("Password changed successfully", "Your account security credentials were changed recently. Contact support if not you.", "ANNOUNCEMENT", "HIGH"),
            ("New course enrolled", "You have been enrolled in advanced Data Structures & Algorithms (CSE-301).", "ACADEMIC", "LOW"),
            ("Faculty uploaded notes", "Dr. Alan Turing uploaded SQL query optimization slides in DBMS module.", "FACULTY", "LOW"),
            ("Internal marks uploaded", "DBMS Quiz 1 grades have been verified and submitted by class coordinator.", "RESULTS", "MEDIUM"),
            ("Final examination timetable released", "The terminal semester theory exams start on 22 Aug 2026.", "EXAMINATION", "HIGH"),
            ("AI recommends revising Data Structures", "Spend 30 minutes on Binary Search Trees today to improve assessment preparedness.", "LEARNING_PLAN", "MEDIUM"),
            ("Project milestone due", "DBMS Course Project Group submission is due in 3 days.", "ASSIGNMENT", "HIGH"),
            ("Mentor meeting tomorrow", "Your monthly advisor consultation is scheduled tomorrow at 2:00 PM.", "FACULTY", "LOW")
        ]

        now = datetime.now(UTC)
        for i in range(150):
            tpl = random.choice(templates)
            created_at = now - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            # Create Notification
            notif = Notification(
                title=f"{tpl[0]} #{i+1}",
                message=tpl[1],
                category=tpl[2],
                priority=tpl[3],
                sender_type="SYSTEM",
                recipient_type="INDIVIDUAL",
                recipient_id=student_id,
                created_at=created_at,
                is_active=True
            )
            self.session.add(notif)
            await self.session.flush()

            # Randomize read/archived/starred/pinned status
            is_read = random.choice([True, False, False])
            is_archived = random.choice([True, False, False, False])
            is_starred = random.choice([True, False, False, False])
            is_pinned = random.choice([True, False, False, False, False])

            if is_read or is_archived or is_starred or is_pinned:
                read_obj = NotificationRead(
                    notification_id=notif.id,
                    student_id=student_id,
                    read_at=created_at + timedelta(hours=random.randint(1, 10)) if is_read else now,
                    is_archived=is_archived,
                    is_starred=is_starred,
                    is_pinned=is_pinned,
                    is_deleted=False
                )
                self.session.add(read_obj)
        
        await self.session.flush()
