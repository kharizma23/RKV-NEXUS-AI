import uuid
from typing import Optional, List, Any
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.roles.model import Role, user_roles_table
from app.modules.users.model import FacultyProfile, StudentProfile, User

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = (
            select(User)
            .options(
                selectinload(User.roles),
                selectinload(User.student_profile),
                selectinload(User.faculty_profile)
            )
            .where(User.id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        from sqlalchemy import func, or_
        cleaned = email.lower().strip()
        conditions = [func.lower(User.email) == cleaned]
        if cleaned == "admin23":
            conditions.append(func.lower(User.email).in_(["admin23", "admin23@gmail.com"]))
        conditions.append(func.lower(StudentProfile.student_id_number) == cleaned)
        conditions.append(func.lower(FacultyProfile.employee_id) == cleaned)

        stmt = (
            select(User)
            .outerjoin(User.student_profile)
            .outerjoin(User.faculty_profile)
            .options(
                selectinload(User.roles),
                selectinload(User.student_profile),
                selectinload(User.faculty_profile)
            )
            .where(or_(*conditions))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        is_verified: bool = False,
        is_approved: bool = True
    ) -> User:
        user = User(
            email=email.lower().strip(),
            password_hash=password_hash,
            full_name=full_name,
            is_verified=is_verified,
            is_approved=is_approved
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def add_role(self, user: User, role: Role) -> None:
        stmt = insert(user_roles_table).values(user_id=user.id, role_id=role.id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def create_student_profile(
        self,
        user_id: uuid.UUID,
        student_id_number: str,
        institution_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        programme_id: Optional[uuid.UUID] = None,
        academic_year_id: Optional[uuid.UUID] = None,
        semester_id: Optional[uuid.UUID] = None,
        preferred_language: str = "en",
        phone_number: Optional[str] = None,
        date_of_birth: Optional[str] = None,
        target_batch: Optional[str] = None,
        target_semester: Optional[int] = None
    ) -> StudentProfile:
        profile = StudentProfile(
            user_id=user_id,
            student_id_number=student_id_number,
            institution_id=institution_id,
            department_id=department_id,
            programme_id=programme_id,
            academic_year_id=academic_year_id,
            semester_id=semester_id,
            preferred_language=preferred_language,
            phone_number=phone_number,
            date_of_birth=date_of_birth,
            target_batch=target_batch,
            target_semester=target_semester
        )
        self.session.add(profile)
        await self.session.flush()
        return profile

    async def create_faculty_profile(
        self,
        user_id: uuid.UUID,
        employee_id: str,
        designation: Optional[str] = None,
        institution_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        phone_number: Optional[str] = None,
        subjects_handled: Optional[Any] = None
    ) -> FacultyProfile:
        profile = FacultyProfile(
            user_id=user_id,
            employee_id=employee_id,
            designation=designation,
            institution_id=institution_id,
            department_id=department_id,
            phone_number=phone_number,
            subjects_handled=subjects_handled
        )
        self.session.add(profile)
        await self.session.flush()
        return profile

    async def list_all_users(self, limit: int = 100, offset: int = 0) -> list[User]:
        stmt = (
            select(User)
            .options(
                selectinload(User.roles),
                selectinload(User.student_profile),
                selectinload(User.faculty_profile)
            )
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_status(self, user: User, is_active: bool) -> User:
        user.is_active = is_active
        await self.session.commit()
        ret = await self.get_by_id(user.id)
        assert ret is not None
        return ret

    async def update_faculty_approval(self, user: User, is_approved: bool) -> User:
        user.is_approved = is_approved
        await self.session.commit()
        ret = await self.get_by_id(user.id)
        assert ret is not None
        return ret
