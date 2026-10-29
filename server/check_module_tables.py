import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def check_tables():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('student_groups', 'proctoring_sessions', 'examinations', 'flexible_exam_windows')
            ORDER BY table_name
        """))
        print("Existing tables:", [r[0] for r in res.fetchall()])

if __name__ == "__main__":
    asyncio.run(check_tables())
