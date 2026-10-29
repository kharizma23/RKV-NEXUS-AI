import asyncio
from app.database.session import AsyncSessionLocal
from app.modules.evaluation.router import get_confidence_queue

async def check():
    async with AsyncSessionLocal() as session:
        # Create a mock user
        class MockUser:
            id = "test"
            role = "FACULTY"
        res = await get_confidence_queue(current_user=MockUser(), db=session)
        print("Stats:", res["stats"])
        print(f"Items count: {len(res['items'])}")
        for it in res["items"]:
            print(f"- {it['student_name']} ({it['roll_number']}): {it['exam_name']} | Q: {it['question_snippet']} | AI Marks: {it['ai_suggested_marks']} | Conf: {it['ai_confidence_score']*100}%")

asyncio.run(check())

