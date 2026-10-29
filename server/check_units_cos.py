import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT count(*) FROM units"))
        print("Units count:", res.scalar())
        res = await session.execute(text("SELECT count(*) FROM topics"))
        print("Topics count:", res.scalar())
        res = await session.execute(text("SELECT count(*) FROM course_outcomes"))
        print("COs count:", res.scalar())
        
        # Check faculty assignments
        res = await session.execute(text("""
            SELECT fsa.id, u.full_name, s.code, s.name, fsa.role_in_subject
            FROM faculty_subject_assignments fsa
            JOIN faculty_profiles fp ON fsa.faculty_id = fp.id
            JOIN users u ON fp.user_id = u.id
            JOIN subjects s ON fsa.subject_id = s.id
        """))
        print("\nFaculty Subject Assignments:")
        for r in res.fetchall():
            print(r)

asyncio.run(check())

