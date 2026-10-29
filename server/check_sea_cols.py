import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'student_exam_attempts' 
            ORDER BY ordinal_position
        """))
        for r in res.fetchall():
            print(r)

asyncio.run(check())

