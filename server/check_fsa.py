import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT fsa.id, fsa.faculty_id, fp.id as fp_id, u.email, u.full_name, s.code, s.name FROM faculty_subject_assignments fsa JOIN faculty_profiles fp ON fsa.faculty_id = fp.id JOIN users u ON fp.user_id = u.id JOIN subjects s ON fsa.subject_id = s.id"))
        for r in res.fetchall():
            print(r)

asyncio.run(check())

