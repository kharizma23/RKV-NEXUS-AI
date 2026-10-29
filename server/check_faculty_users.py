import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT u.id, u.email, u.full_name, fp.id FROM users u LEFT JOIN faculty_profiles fp ON fp.user_id = u.id WHERE fp.id IS NOT NULL"))
        for r in res.fetchall():
            print("Faculty in DB:", r)

asyncio.run(check())

