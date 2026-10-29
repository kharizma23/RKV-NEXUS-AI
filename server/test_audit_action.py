import asyncio
import uuid
from app.database.session import AsyncSessionLocal
from app.modules.evaluation.router import get_confidence_queue, audit_answer, AuditAnswerRequest

async def check():
    async with AsyncSessionLocal() as session:
        class MockUser:
            id = "test"
            role = "FACULTY"

        # Check queue
        res = await get_confidence_queue(current_user=MockUser(), db=session)
        print("Initial queue count:", len(res["items"]))
        first_item = res["items"][0]
        aid = uuid.UUID(first_item["id"])
        print(f"Auditing answer {aid} for {first_item['student_name']}...")

        # Audit with 8.5 marks
        req = AuditAnswerRequest(confirmed_marks=8.5, faculty_feedback="Audited and confirmed by faculty evaluator.")
        audit_res = await audit_answer(answer_id=aid, payload=req, current_user=MockUser(), db=session)
        print("Audit response:", audit_res)

        # Check queue again
        res2 = await get_confidence_queue(current_user=MockUser(), db=session)
        print("New queue count:", len(res2["items"]))
        assert not any(i["id"] == str(aid) for i in res2["items"]), "Audited item should not be in queue!"
        print("SUCCESS! Audited item disappeared from confidence queue.")

asyncio.run(check())

