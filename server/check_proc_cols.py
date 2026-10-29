import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def check_proc_cols():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'proctoring_sessions'"))
        for row in res.fetchall():
            print(f"  {row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(check_proc_cols())
