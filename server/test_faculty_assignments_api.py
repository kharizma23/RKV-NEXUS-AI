import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import AsyncSessionLocal
from app.modules.users.model import User
from app.modules.academics.repository import AcademicsRepository
from app.modules.academics.schema import FacultySubjectAssignmentResponse

async def check():
    async with AsyncSessionLocal() as session:
        q = select(User).options(selectinload(User.faculty_profile)).where(User.email == 'faculty@platform.edu')
        user = (await session.execute(q)).scalar_one_or_none()
        if not user or not user.faculty_profile:
            print("Faculty user or profile not found!")
            return
        
        repo = AcademicsRepository(session)
        assignments = await repo.list_faculty_assignments(user.faculty_profile.id)
        print(f"Assignments count: {len(assignments)}")
        for a in assignments:
            print(f"Subject: {a.subject.name} ({a.subject.code})")
            print(f"  Units count: {len(a.subject.units)}")
            for u in a.subject.units:
                print(f"    Unit {u.unit_number}: {u.title} ({len(u.topics)} topics)")
            print(f"  COs count: {len(a.subject.course_outcomes)}")
            for co in a.subject.course_outcomes:
                print(f"    {co.code} [{co.bloom_level}]: {co.statement[:50]}...")

            res_obj = FacultySubjectAssignmentResponse.model_validate(a)
            print("  Successfully validated Pydantic schema!")
            print(f"  Serialized JSON snippet: {res_obj.model_dump_json()[:200]}...")

asyncio.run(check())
