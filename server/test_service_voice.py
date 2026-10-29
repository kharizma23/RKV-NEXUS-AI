import asyncio
from app.database.session import AsyncSessionLocal
from app.modules.exam_conduction_evaluation.service import ExamConductionService

async def check():
    async with AsyncSessionLocal() as session:
        service = ExamConductionService(session)
        queue = await service.get_faculty_voice_review_queue()
        print(f"Voice review queue items: {len(queue)}")
        for item in queue:
            print(item)

asyncio.run(check())

