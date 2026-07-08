import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles, get_current_active_user
from app.modules.academics.repository import AcademicsRepository
from app.modules.academics.schema import (
    ProgrammeResponse, ProgrammeCreate, AcademicYearResponse, AcademicYearCreate,
    SemesterResponse, SemesterCreate, CourseResponse, CourseCreate,
    SubjectResponse, SubjectCreate, SubjectEnrolmentResponse, SubjectEnrolmentCreate,
    FacultySubjectAssignmentResponse, FacultySubjectAssignmentCreate
)
from app.modules.users.model import User

router = APIRouter(prefix="/academics", tags=["Academic Management"])

# Programmes
@router.get("/programmes", response_model=list[ProgrammeResponse])
async def list_programmes(db: AsyncSession = Depends(get_db)):
    repo = AcademicsRepository(db)
    return await repo.list_programmes()

@router.post("/programmes", response_model=ProgrammeResponse, status_code=status.HTTP_201_CREATED)
async def create_programme(
    payload: ProgrammeCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    prog = await repo.create_programme(
        department_id=payload.department_id,
        name=payload.name or payload.programme_name or "",
        code=payload.code or payload.programme_code or "",
        institution_id=payload.institution_id,
        degree_type=payload.degree_type,
        duration_years=payload.duration_years,
        total_semesters=payload.total_semesters,
        regulation_name=payload.regulation_name,
        description=payload.description,
        is_active=payload.is_active,
        auto_create_semesters=payload.auto_create_semesters,
    )
    await db.commit()
    return prog

# Academic Years & Semesters
@router.get("/academic-years", response_model=list[AcademicYearResponse])
async def list_academic_years(db: AsyncSession = Depends(get_db)):
    repo = AcademicsRepository(db)
    return await repo.list_academic_years()

@router.post("/academic-years", response_model=AcademicYearResponse, status_code=status.HTTP_201_CREATED)
async def create_academic_year(
    payload: AcademicYearCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    ay = await repo.create_academic_year(payload.institution_id, payload.year_label, payload.start_date, payload.end_date, payload.is_current)
    await db.commit()
    return ay

@router.post("/semesters", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
async def create_semester(
    payload: SemesterCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    sem = await repo.create_semester(payload.academic_year_id, payload.semester_number, payload.term_type, payload.start_date, payload.end_date, payload.is_active)
    await db.commit()
    return sem

# Courses & Subjects
@router.get("/courses", response_model=list[CourseResponse])
async def list_courses(db: AsyncSession = Depends(get_db)):
    repo = AcademicsRepository(db)
    return await repo.list_courses()

@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    course = await repo.create_course(payload.department_id, payload.programme_id, payload.code, payload.name, payload.credits, payload.description)
    await db.commit()
    return course

@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(db: AsyncSession = Depends(get_db)):
    repo = AcademicsRepository(db)
    return await repo.list_subjects()

@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    payload: SubjectCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    subj = await repo.create_subject(payload.course_id, payload.semester_id, payload.code, payload.name, payload.subject_type)
    await db.commit()
    return await repo.get_subject_by_id(subj.id)

# Enrolments & Faculty Assignments
@router.post("/enrolments", response_model=SubjectEnrolmentResponse, status_code=status.HTTP_201_CREATED)
async def create_enrolment(
    payload: SubjectEnrolmentCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    enr = await repo.create_enrolment(payload.student_id, payload.subject_id, payload.semester_id)
    await db.commit()
    return enr

@router.get("/enrolments/my", response_model=list[SubjectEnrolmentResponse])
async def my_enrolments(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    if not current_user.student_profile:
        return []
    return await repo.list_student_enrolments(current_user.student_profile.id)

@router.post("/faculty-assignments", response_model=FacultySubjectAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_faculty_assignment(
    payload: FacultySubjectAssignmentCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    asgn = await repo.create_faculty_assignment(payload.faculty_id, payload.subject_id, payload.semester_id, payload.role_in_subject)
    await db.commit()
    return asgn

@router.get("/faculty-assignments/my", response_model=list[FacultySubjectAssignmentResponse])
async def my_faculty_assignments(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AcademicsRepository(db)
    if not current_user.faculty_profile:
        return []
    return await repo.list_faculty_assignments(current_user.faculty_profile.id)
