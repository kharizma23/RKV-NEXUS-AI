import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def check():
    async with async_engine.connect() as conn:
        res = await conn.execute(text("SELECT id, title FROM examinations LIMIT 5"))
        exams = res.fetchall()
        print("Exams:", exams)

        res = await conn.execute(text("SELECT id, question_text, max_marks FROM questions LIMIT 5"))
        questions = res.fetchall()
        print("Questions count:", len(questions))

        res = await conn.execute(text("SELECT id, user_id FROM student_profiles LIMIT 5"))
        students = res.fetchall()
        print("Students:", students)

        res = await conn.execute(text("SELECT id, full_name, email FROM users WHERE role = 'student' LIMIT 5"))
        users = res.fetchall()
        print("Student users:", users)

asyncio.run(check())
