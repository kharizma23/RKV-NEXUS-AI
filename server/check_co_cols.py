import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        for t in ['co_attainments', 'student_skill_profile']:
            print(f"\n--- {t} ---")
            res = await session.execute(text(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{t}' 
                ORDER BY ordinal_position
            """))
            for r in res.fetchall():
                print(r)
            res2 = await session.execute(text(f"SELECT * FROM {t} LIMIT 3"))
            print("Sample data:", res2.fetchall())

asyncio.run(check())
