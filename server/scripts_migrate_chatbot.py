import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def migrate():
    async with AsyncSessionLocal() as session:
        print("Checking and adding missing columns in database...")
        await session.execute(text("ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS topic VARCHAR(255);"))
        await session.execute(text("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'en';"))
        await session.commit()
        print("Database schema migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
