import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT id, student_id, transcribed_text, confidence_score, status FROM voice_submissions"))
        rows = res.fetchall()
        print(f"Total voice submissions: {len(rows)}")
        for r in rows:
            print(r)

asyncio.run(check())

