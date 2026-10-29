import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT id, title, start_time, end_time, status, duration_minutes, subject_id FROM examinations LIMIT 5"))
        for r in res.fetchall():
            print(r)

if __name__ == "__main__":
    asyncio.run(check())
