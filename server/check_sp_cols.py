import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def check():
    async with async_engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'student_profiles'"))
        print("Student profiles columns:", [r[0] for r in res.fetchall()])

asyncio.run(check())
