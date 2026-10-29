import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        for table in ['units', 'topics', 'course_outcomes']:
            print(f"\n--- COLUMNS FOR {table} ---")
            res = await session.execute(text(f"""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = '{table}' 
                ORDER BY ordinal_position
            """))
            for r in res.fetchall():
                print(r)

asyncio.run(check())
