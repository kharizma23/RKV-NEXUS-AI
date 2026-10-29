import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        # Add faculty_marks column if it doesn't exist
        await session.execute(text("ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS faculty_marks DOUBLE PRECISION"))
        await session.commit()
        print("Ensured faculty_marks column exists in student_answers!")

asyncio.run(check())

