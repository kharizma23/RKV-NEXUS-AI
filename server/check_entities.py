import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT sp.id as profile_id, u.full_name, u.email, sp.student_id_number
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            ORDER BY u.full_name
        """))
        for r in res.fetchall():
            print(r)

        print("\n--- EXAMINATIONS ---")
        res2 = await session.execute(text("SELECT id, title, total_marks FROM examinations LIMIT 5"))
        for r in res2.fetchall():
            print(r)

        print("\n--- QUESTIONS ---")
        res3 = await session.execute(text("SELECT id, prompt, default_marks, question_type FROM questions LIMIT 5"))
        for r in res3.fetchall():
            print(r)

asyncio.run(check())

