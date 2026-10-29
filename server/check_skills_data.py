import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        for t in ['co_attainments', 'student_skill_profile', 'skill_evaluations', 'student_answers', 'student_exam_attempts']:
            res = await session.execute(text(f"SELECT count(*) FROM {t}"))
            print(f"Count for {t}:", res.scalar())

asyncio.run(check())
