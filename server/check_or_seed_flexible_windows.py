import asyncio
from datetime import datetime, timedelta, UTC
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def setup():
    async with AsyncSessionLocal() as session:
        now = datetime.now(UTC)
        res = await session.execute(text("SELECT id, title FROM examinations LIMIT 6"))
        rows = res.fetchall()

        updates = [
            (rows[0][0], "Operating Systems & Concurrency Adaptive Exam", now - timedelta(hours=14), now + timedelta(hours=34), "ACTIVE", 90),
            (rows[1][0], "Data Structures & Tree Balancing Final Window", now - timedelta(hours=6), now + timedelta(hours=42), "ACTIVE", 120),
            (rows[2][0], "Machine Learning & Neural Architectures Comprehensive", now + timedelta(days=1), now + timedelta(days=3), "UPCOMING", 75),
            (rows[3][0], "Database Systems & Transaction Isolation Window", now + timedelta(days=3), now + timedelta(days=5), "UPCOMING", 60),
            (rows[4][0], "Computer Networks & Socket Programming Midterm", now - timedelta(days=4), now - timedelta(days=2), "CLOSED", 90),
            (rows[5][0], "Compiler Design & Lexical Analysis Test", now - timedelta(days=6), now - timedelta(days=4), "CLOSED", 60)
        ]

        for exam_id, title, st, et, stat, dur in updates:
            await session.execute(text("""
                UPDATE examinations 
                SET title = :title, start_time = :st, end_time = :et, status = :stat, duration_minutes = :dur, is_published = true
                WHERE id = :id
            """), {"id": exam_id, "title": title, "st": st, "et": et, "stat": stat, "dur": dur})
        
        await session.commit()
        print("Updated 6 examinations with Active, Upcoming, and Closed flexible windows!")

if __name__ == "__main__":
    asyncio.run(setup())
