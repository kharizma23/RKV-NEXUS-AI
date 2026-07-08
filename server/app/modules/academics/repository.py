import uuid
from typing import List, Optional
from datetime import datetime, date, timedelta, UTC
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.academics.model import (
    Programme, AcademicYear, Semester, Course, Subject, SubjectEnrolment, FacultySubjectAssignment
)
from app.modules.institutions.model import Institution, Department
from app.modules.users.model import StudentProfile, User
from app.core.exceptions import ResourceNotFoundError, DuplicateResourceError, BaseAppException


class AcademicsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    # ==================== PROGRAMME MANAGEMENT ====================

    async def get_programme_by_id(self, programme_id: uuid.UUID) -> Optional[Programme]:
        stmt = (
            select(Programme)
            .options(
                selectinload(Programme.institution),
                selectinload(Programme.department),
                selectinload(Programme.courses),
            )
            .where(Programme.id == programme_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_programmes(
        self,
        institution_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        is_active: Optional[bool] = None,
    ) -> list[Programme]:
        stmt = select(Programme).options(
            selectinload(Programme.institution),
            selectinload(Programme.department),
            selectinload(Programme.courses),
        )

        if institution_id:
            stmt = stmt.where(Programme.institution_id == institution_id)
        if department_id:
            stmt = stmt.where(Programme.department_id == department_id)
        if is_active is not None:
            stmt = stmt.where(Programme.is_active == is_active)

        stmt = stmt.order_by(Programme.name)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_enrolled_students_count(self, programme_id: uuid.UUID) -> int:
        stmt = select(func.count(StudentProfile.id)).where(StudentProfile.programme_id == programme_id)
        res = await self.session.execute(stmt)
        return res.scalar_one() or 0

    async def list_programme_students(self, programme_id: uuid.UUID) -> list[dict]:
        stmt = (
            select(StudentProfile)
            .options(selectinload(StudentProfile.user))
            .where(StudentProfile.programme_id == programme_id)
        )
        res = await self.session.execute(stmt)
        students = res.scalars().all()
        output = []
        for s in students:
            output.append({
                "id": s.id,
                "student_id_number": s.student_id_number,
                "full_name": s.user.full_name if s.user else "N/A",
                "email": s.user.email if s.user else "N/A",
            })
        return output

    async def validate_programme_data(
        self,
        institution_id: Optional[uuid.UUID],
        department_id: uuid.UUID,
        name: str,
        code: str,
        duration_years: int,
        total_semesters: int,
        exclude_programme_id: Optional[uuid.UUID] = None,
        confirm_unusual_name: bool = False,
    ):
        # 1. Whitespace & empty checks
        clean_name = name.strip() if name else ""
        clean_code = code.strip().upper() if code else ""

        if not clean_name:
            raise BaseAppException(code="INVALID_NAME", message="Programme name cannot be empty or whitespace only")
        if not clean_code:
            raise BaseAppException(code="INVALID_CODE", message="Programme code cannot be empty or whitespace only")

        import re
        if not re.match(r"^[A-Z0-9\-]+$", clean_code):
            raise BaseAppException(code="INVALID_CODE", message="Programme code must contain only letters, numbers, and hyphens.")

        # Reject names that match subjects unless confirmed
        DEGREE_KEYWORDS = [
            "bachelor", "master", "b.", "m.", "diploma", "degree", "doctor",
            "ph.d", "btech", "mtech", "mca", "mba", "b.e", "m.e", "b.sc",
            "m.sc", "bba", "b.des", "phd", "pgd", "ug", "pg", "associate"
        ]
        has_degree_keyword = any(kw in clean_name.lower() for kw in DEGREE_KEYWORDS)
        if not has_degree_keyword and not confirm_unusual_name:
            raise BaseAppException(
                code="SUBJECT_LIKE_NAME",
                message="Enter the complete degree programme name, not an individual subject name."
            )

        if duration_years < 1 or duration_years > 8:
            raise BaseAppException(code="INVALID_DURATION", message="Duration must be between 1 and 8 years")
        if total_semesters < 1 or total_semesters > 16:
            raise BaseAppException(code="INVALID_SEMESTERS", message="Total semesters must be between 1 and 16")

        # Check department exists
        dept_stmt = select(Department).where(Department.id == department_id)
        dept_res = await self.session.execute(dept_stmt)
        dept = dept_res.scalar_one_or_none()
        if not dept:
            raise ResourceNotFoundError("Department")

        target_inst_id = institution_id or dept.institution_id

        # Check institution exists
        inst_stmt = select(Institution).where(Institution.id == target_inst_id)
        inst_res = await self.session.execute(inst_stmt)
        inst = inst_res.scalar_one_or_none()
        if not inst:
            raise ResourceNotFoundError("Institution")

        if dept.institution_id != target_inst_id:
            raise BaseAppException(code="INVALID_DEPARTMENT", message="The selected department does not belong to this institution.")

        # Duplicate programme code within institution
        code_stmt = select(Programme).where(
            Programme.institution_id == target_inst_id,
            func.upper(Programme.code) == clean_code
        )
        if exclude_programme_id:
            code_stmt = code_stmt.where(Programme.id != exclude_programme_id)
        code_res = await self.session.execute(code_stmt)
        if code_res.scalar_one_or_none():
            raise DuplicateResourceError(f"A programme with code {clean_code} already exists in this institution.")

        # Duplicate programme name within department (case-insensitive)
        name_stmt = select(Programme).where(
            Programme.department_id == department_id,
            func.lower(Programme.name) == clean_name.lower()
        )
        if exclude_programme_id:
            name_stmt = name_stmt.where(Programme.id != exclude_programme_id)
        name_res = await self.session.execute(name_stmt)
        if name_res.scalar_one_or_none():
            raise DuplicateResourceError("This programme already exists under the selected department.")

        return target_inst_id, clean_name, clean_code

    async def create_programme(
        self,
        department_id: uuid.UUID,
        name: str,
        code: str,
        institution_id: Optional[uuid.UUID] = None,
        degree_type: str = "Bachelor of Technology",
        duration_years: int = 4,
        total_semesters: int = 8,
        regulation_name: Optional[str] = None,
        description: Optional[str] = None,
        is_active: bool = True,
        created_by: Optional[uuid.UUID] = None,
        auto_create_semesters: bool = True,
        confirm_unusual_name: bool = False,
    ) -> Programme:
        target_inst_id, clean_name, clean_code = await self.validate_programme_data(
            institution_id=institution_id,
            department_id=department_id,
            name=name,
            code=code,
            duration_years=duration_years,
            total_semesters=total_semesters,
            confirm_unusual_name=confirm_unusual_name,
        )

        prog = Programme(
            institution_id=target_inst_id,
            department_id=department_id,
            name=clean_name,
            code=clean_code,
            degree_type=degree_type,
            duration_years=duration_years,
            total_semesters=total_semesters,
            regulation_name=regulation_name,
            description=description,
            is_active=is_active,
            created_by=created_by,
        )
        self.session.add(prog)
        await self.session.flush()

        # Semester Auto-Generation
        if auto_create_semesters:
            await self.auto_generate_semesters_for_programme(target_inst_id, total_semesters)

        return await self.get_programme_by_id(prog.id) # type: ignore

    async def auto_generate_semesters_for_programme(self, institution_id: uuid.UUID, total_semesters: int):
        # Find active academic year for institution
        ay_stmt = select(AcademicYear).where(AcademicYear.institution_id == institution_id, AcademicYear.is_current == True)
        ay_res = await self.session.execute(ay_stmt)
        ay = ay_res.scalar_one_or_none()

        if not ay:
            raise BaseAppException(
                code="MISSING_ACADEMIC_YEAR",
                message="Configure an active academic year before automatically creating semesters."
            )

        # Check existing semesters
        existing_sem_stmt = select(Semester).where(Semester.academic_year_id == ay.id)
        existing_res = await self.session.execute(existing_sem_stmt)
        existing_numbers = {s.semester_number for s in existing_res.scalars().all()}

        today = datetime.now(UTC).date()
        for s_num in range(1, total_semesters + 1):
            if s_num not in existing_numbers:
                term = "ODD" if s_num % 2 == 1 else "EVEN"
                sem = Semester(
                    academic_year_id=ay.id,
                    semester_number=s_num,
                    term_type=term,
                    start_date=today,
                    end_date=today + timedelta(days=180),
                    is_active=True,
                )
                self.session.add(sem)
        await self.session.flush()

    async def update_programme(
        self,
        programme_id: uuid.UUID,
        institution_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        name: Optional[str] = None,
        code: Optional[str] = None,
        degree_type: Optional[str] = None,
        duration_years: Optional[int] = None,
        total_semesters: Optional[int] = None,
        regulation_name: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
        confirm_unusual_name: bool = False,
    ) -> Programme:
        prog = await self.get_programme_by_id(programme_id)
        if not prog:
            raise ResourceNotFoundError("Programme")

        target_inst = institution_id or prog.institution_id
        target_dept = department_id or prog.department_id
        target_name = name if name is not None else prog.name
        target_code = code if code is not None else prog.code
        target_dur = duration_years if duration_years is not None else prog.duration_years
        target_sem = total_semesters if total_semesters is not None else prog.total_semesters

        target_inst, clean_name, clean_code = await self.validate_programme_data(
            institution_id=target_inst,
            department_id=target_dept,
            name=target_name,
            code=target_code,
            duration_years=target_dur,
            total_semesters=target_sem,
            exclude_programme_id=programme_id,
            confirm_unusual_name=confirm_unusual_name,
        )

        prog.institution_id = target_inst
        prog.department_id = target_dept
        prog.name = clean_name
        prog.code = clean_code
        if degree_type is not None:
            prog.degree_type = degree_type
        prog.duration_years = target_dur
        prog.total_semesters = target_sem
        if regulation_name is not None:
            prog.regulation_name = regulation_name
        if description is not None:
            prog.description = description
        if is_active is not None:
            prog.is_active = is_active

        await self.session.flush()
        return await self.get_programme_by_id(programme_id) # type: ignore

    async def set_programme_status(self, programme_id: uuid.UUID, is_active: bool) -> Programme:
        prog = await self.get_programme_by_id(programme_id)
        if not prog:
            raise ResourceNotFoundError("Programme")
        prog.is_active = is_active
        await self.session.flush()
        return prog

    # ==================== ACADEMIC YEARS & SEMESTERS ====================

    async def create_academic_year(self, institution_id: uuid.UUID, year_label: str, start_date, end_date, is_current: bool = True) -> AcademicYear:
        ay = AcademicYear(institution_id=institution_id, year_label=year_label, start_date=start_date, end_date=end_date, is_current=is_current)
        self.session.add(ay)
        await self.session.flush()
        stmt = select(AcademicYear).options(selectinload(AcademicYear.semesters)).where(AcademicYear.id == ay.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def list_academic_years(self, institution_id: Optional[uuid.UUID] = None) -> list[AcademicYear]:
        stmt = select(AcademicYear).options(selectinload(AcademicYear.semesters))
        if institution_id:
            stmt = stmt.where(AcademicYear.institution_id == institution_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_semester(self, academic_year_id: uuid.UUID, semester_number: int, term_type: str, start_date, end_date, is_active: bool = True) -> Semester:
        sem = Semester(academic_year_id=academic_year_id, semester_number=semester_number, term_type=term_type, start_date=start_date, end_date=end_date, is_active=is_active)
        self.session.add(sem)
        await self.session.flush()
        return sem

    # ==================== COURSES & SUBJECTS ====================

    async def create_course(self, department_id: uuid.UUID, programme_id: uuid.UUID, code: str, name: str, credits: int = 4, description: Optional[str] = None) -> Course:
        course = Course(department_id=department_id, programme_id=programme_id, code=code.upper(), name=name, credits=credits, description=description)
        self.session.add(course)
        await self.session.flush()
        stmt = select(Course).options(selectinload(Course.subjects)).where(Course.id == course.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def list_courses(self) -> list[Course]:
        stmt = select(Course).options(selectinload(Course.subjects))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_subject(self, course_id: uuid.UUID, semester_id: uuid.UUID, code: str, name: str, subject_type: str = "THEORY") -> Subject:
        subject = Subject(course_id=course_id, semester_id=semester_id, code=code.upper(), name=name, subject_type=subject_type)
        self.session.add(subject)
        await self.session.flush()
        stmt = select(Subject).options(selectinload(Subject.units), selectinload(Subject.course_outcomes)).where(Subject.id == subject.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def get_subject_by_id(self, subject_id: uuid.UUID) -> Optional[Subject]:
        stmt = select(Subject).options(selectinload(Subject.units), selectinload(Subject.course_outcomes)).where(Subject.id == subject_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_subjects(self) -> list[Subject]:
        stmt = select(Subject).options(selectinload(Subject.units), selectinload(Subject.course_outcomes))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    # ==================== ENROLMENTS & FACULTY ASSIGNMENTS ====================

    async def create_enrolment(self, student_id: uuid.UUID, subject_id: uuid.UUID, semester_id: uuid.UUID) -> SubjectEnrolment:
        enr = SubjectEnrolment(student_id=student_id, subject_id=subject_id, semester_id=semester_id, is_active=True)
        self.session.add(enr)
        await self.session.flush()
        stmt = select(SubjectEnrolment).options(
            selectinload(SubjectEnrolment.subject).selectinload(Subject.units),
            selectinload(SubjectEnrolment.subject).selectinload(Subject.course_outcomes)
        ).where(SubjectEnrolment.id == enr.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def list_student_enrolments(self, student_id: uuid.UUID) -> list[SubjectEnrolment]:
        stmt = select(SubjectEnrolment).options(
            selectinload(SubjectEnrolment.subject).selectinload(Subject.units),
            selectinload(SubjectEnrolment.subject).selectinload(Subject.course_outcomes)
        ).where(SubjectEnrolment.student_id == student_id, SubjectEnrolment.is_active == True)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_faculty_assignment(self, faculty_id: uuid.UUID, subject_id: uuid.UUID, semester_id: uuid.UUID, role_in_subject: str = "INSTRUCTOR") -> FacultySubjectAssignment:
        assignment = FacultySubjectAssignment(faculty_id=faculty_id, subject_id=subject_id, semester_id=semester_id, role_in_subject=role_in_subject)
        self.session.add(assignment)
        await self.session.flush()
        return assignment

    async def list_faculty_assignments(self, faculty_id: uuid.UUID) -> list[FacultySubjectAssignment]:
        stmt = select(FacultySubjectAssignment).options(
            selectinload(FacultySubjectAssignment.subject).selectinload(Subject.units),
            selectinload(FacultySubjectAssignment.subject).selectinload(Subject.course_outcomes)
        ).where(FacultySubjectAssignment.faculty_id == faculty_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
