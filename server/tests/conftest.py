import asyncio
from collections.abc import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.api.dependencies import get_db
from app.core.security import hash_password
from app.database.base import Base
from app.main import app
from app.modules.roles.model import Role, Permission
from app.modules.institutions.model import Institution, Department
from app.modules.users.model import User, StudentProfile, FacultyProfile
from datetime import UTC

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture(autouse=True)
async def seed_roles_and_admin(db_session: AsyncSession):
    role_names = ["STUDENT", "FACULTY", "EXAMINER", "DEPARTMENT_HEAD", "ADMIN"]
    roles_map = {}
    for r_name in role_names:
        existing_role = await db_session.scalar(select(Role).where(Role.name == r_name))
        if not existing_role:
            role = Role(name=r_name, description=f"{r_name} role")
            db_session.add(role)
            await db_session.flush()
            roles_map[r_name] = role
        else:
            roles_map[r_name] = existing_role

    # Seed Admin User
    admin_email = "admin@test.com"
    existing_admin = await db_session.scalar(select(User).where(User.email == admin_email))
    if not existing_admin:
        admin = User(
            email=admin_email,
            password_hash=hash_password("AdminPass123!"),
            full_name="Test Admin",
            is_active=True,
            is_verified=True,
            is_approved=True,
            account_status="ACTIVE"
        )
        admin.roles.append(roles_map["ADMIN"])
        db_session.add(admin)

    # Seed Approved Faculty
    fac_email = "faculty.approved@test.com"
    existing_fac = await db_session.scalar(select(User).where(User.email == fac_email))
    if not existing_fac:
        fac = User(
            email=fac_email,
            password_hash=hash_password("FacultyPass123!"),
            full_name="Prof Approved",
            is_active=True,
            is_verified=True,
            is_approved=True,
            account_status="ACTIVE"
        )
        fac.roles.append(roles_map["FACULTY"])
        db_session.add(fac)
        await db_session.flush()
        fp = FacultyProfile(user_id=fac.id, employee_id="EMP-TEST-001", designation="Professor", approval_status="APPROVED")
        db_session.add(fp)

    # Seed Pending Faculty
    fac_pend_email = "faculty.pending@test.com"
    existing_fac_pend = await db_session.scalar(select(User).where(User.email == fac_pend_email))
    if not existing_fac_pend:
        fac_pend = User(
            email=fac_pend_email,
            password_hash=hash_password("FacultyPass123!"),
            full_name="Prof Pending",
            is_active=True,
            is_verified=True,
            is_approved=False,
            account_status="PENDING_APPROVAL"
        )
        fac_pend.roles.append(roles_map["FACULTY"])
        db_session.add(fac_pend)
        await db_session.flush()
        fp_pend = FacultyProfile(user_id=fac_pend.id, employee_id="EMP-TEST-002", designation="Assistant Professor", approval_status="PENDING_APPROVAL")
        db_session.add(fp_pend)

    # Seed Student
    student_email = "student@test.com"
    existing_student = await db_session.scalar(select(User).where(User.email == student_email))
    if not existing_student:
        student = User(
            email=student_email,
            password_hash=hash_password("StudentPass123!"),
            full_name="Student Test",
            is_active=True,
            is_verified=True,
            is_approved=True,
            account_status="ACTIVE"
        )
        student.roles.append(roles_map["STUDENT"])
        db_session.add(student)
        await db_session.flush()
        sp = StudentProfile(user_id=student.id, student_id_number="STU-TEST-001")
        db_session.add(sp)

    # Seed Institution & Department
    inst = await db_session.scalar(select(Institution).where(Institution.code == "AIT"))
    if not inst:
        inst = Institution(name="Apex Institute of Technology", code="AIT", is_active=True)
        db_session.add(inst)
        await db_session.flush()

    dept = await db_session.scalar(select(Department).where(Department.code == "CSE"))
    if not dept:
        dept = Department(institution_id=inst.id, name="Computer Science & Engineering", code="CSE")
        db_session.add(dept)
        await db_session.flush()

    from app.modules.academics.model import Programme, AcademicYear, Semester, Course, Subject
    from datetime import date

    prog = await db_session.scalar(select(Programme).where(Programme.code == "BTECH-CSE"))
    if not prog:
        prog = Programme(institution_id=inst.id, department_id=dept.id, name="B.Tech Computer Science & Engineering", code="BTECH-CSE")
        db_session.add(prog)
        await db_session.flush()

    ay = await db_session.scalar(select(AcademicYear).where(AcademicYear.year_label == "2024-2025"))
    if not ay:
        ay = AcademicYear(institution_id=inst.id, year_label="2024-2025", start_date=date(2024, 8, 1), end_date=date(2025, 5, 31), is_current=True)
        db_session.add(ay)
        await db_session.flush()

    sem = await db_session.scalar(select(Semester).where(Semester.academic_year_id == ay.id, Semester.semester_number == 1))
    if not sem:
        sem = Semester(academic_year_id=ay.id, semester_number=1, term_type="ODD", start_date=date(2024, 8, 1), end_date=date(2024, 12, 20), is_active=True)
        db_session.add(sem)
        await db_session.flush()

    course = await db_session.scalar(select(Course).where(Course.code == "CS-201"))
    if not course:
        course = Course(department_id=dept.id, programme_id=prog.id, code="CS-201", name="Data Structures", credits=4)
        db_session.add(course)
        await db_session.flush()

    subj = await db_session.scalar(select(Subject).where(Subject.code == "CS-201-T"))
    if not subj:
        subj = Subject(course_id=course.id, semester_id=sem.id, code="CS-201-T", name="Data Structures Theory")
        db_session.add(subj)
        await db_session.flush()

    from app.modules.examinations.model import Examination
    from datetime import datetime, timedelta, timezone

    exam = await db_session.scalar(select(Examination).where(Examination.title == "Test Exam"))
    if not exam:
        now_tz = datetime.now(UTC)
        exam = Examination(
            subject_id=subj.id,
            title="Test Exam",
            exam_type="MID_TERM",
            total_marks=10.0,
            duration_minutes=60,
            start_time=now_tz - timedelta(days=1),
            end_time=now_tz + timedelta(days=7),
            is_published=True
        )
        db_session.add(exam)

    await db_session.commit()
