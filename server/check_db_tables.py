import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = [r[0] for r in res.fetchall()]
        print("Tables:", tables)

asyncio.run(check())

