import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def test_queries():
    async with async_engine.connect() as conn:
        # Confidence queue query test
        res = await conn.execute(text("""
            SELECT 
                sa.id, sa.attempt_id, sa.question_id, sa.text_response, sa.image_url,
                sa.score_awarded, sa.ai_confidence_score, sa.status, sa.counterfactual_feedback,
                sa.ai_suggested_marks, sa.rubric_breakdown, sa.extracted_text, sa.evaluator_feedback,
                q.prompt as question_prompt, q.default_marks as max_marks,
                u.full_name as student_name, sp.id as student_id,
                e.title as exam_title
            FROM student_answers sa
            LEFT JOIN questions q ON sa.question_id = q.id
            LEFT JOIN student_exam_attempts sea ON sa.attempt_id = sea.id
            LEFT JOIN examinations e ON sea.exam_id = e.id
            LEFT JOIN student_profiles sp ON sea.student_id = sp.id
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sa.ai_confidence_score < 0.8 AND sa.status = 'PENDING_AUDIT'
            ORDER BY sa.ai_confidence_score ASC
        """))
        rows = res.fetchall()
        print(f"Found {len(rows)} pending confidence queue records!")
        for r in rows[:2]:
            print(f"- {r.student_name or 'Student'}: {r.exam_title or 'Exam'} | Conf: {r.ai_confidence_score} | Marks: {r.ai_suggested_marks}/{r.max_marks}")

        # Counterfactual query test
        res = await conn.execute(text("""
            SELECT 
                sa.id, sa.text_response, sa.score_awarded, sa.ai_suggested_marks,
                sa.counterfactual_feedback, sa.evaluator_feedback, sa.status,
                q.prompt as question_prompt, q.default_marks as max_marks,
                u.full_name as student_name, sp.id as student_id,
                e.title as exam_title
            FROM student_answers sa
            LEFT JOIN questions q ON sa.question_id = q.id
            LEFT JOIN student_exam_attempts sea ON sa.attempt_id = sea.id
            LEFT JOIN examinations e ON sea.exam_id = e.id
            LEFT JOIN student_profiles sp ON sea.student_id = sp.id
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sa.counterfactual_feedback IS NOT NULL AND sa.counterfactual_feedback != ''
        """))
        crows = res.fetchall()
        print(f"Found {len(crows)} counterfactual feedback records!")
        for r in crows[:2]:
            print(f"- {r.student_name or 'Student'}: {r.counterfactual_feedback[:60]}...")

asyncio.run(test_queries())
