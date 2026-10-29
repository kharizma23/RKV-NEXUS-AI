import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        # Check student_answers count
        res = await session.execute(text("SELECT count(*) FROM student_answers"))
        print("Total student_answers:", res.scalar())

        # Check answers with status and confidence
        res2 = await session.execute(text("SELECT id, ai_confidence_score, status, score_awarded, ai_suggested_marks FROM student_answers LIMIT 10"))
        rows = res2.fetchall()
        print(f"Sample answers ({len(rows)}):")
        for r in rows:
            print(r)

        # Check existing examinations, questions, attempts, student_profiles
        res_e = await session.execute(text("SELECT id, title FROM examinations LIMIT 3"))
        print("\nExaminations:", res_e.fetchall())

        res_q = await session.execute(text("SELECT id, prompt FROM questions LIMIT 3"))
        print("\nQuestions:", res_q.fetchall())

        res_sp = await session.execute(text("""
            SELECT sp.id, u.full_name, sp.student_id_number 
            FROM student_profiles sp 
            JOIN users u ON sp.user_id = u.id 
            LIMIT 3
        """))
        print("\nStudents:", res_sp.fetchall())

        res_sea = await session.execute(text("SELECT id, exam_id, student_id FROM student_exam_attempts LIMIT 3"))
        print("\nAttempts:", res_sea.fetchall())

asyncio.run(check())

