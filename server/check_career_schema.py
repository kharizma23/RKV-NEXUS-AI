import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'career_roles' 
            ORDER BY ordinal_position
        """))
        print("career_roles columns:")
        for r in res.fetchall():
            print(r)

        res2 = await session.execute(text("SELECT count(*) FROM career_roles"))
        print("Existing career_roles count:", res2.scalar())

        # Also check career_predictions table
        res3 = await session.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'career_predictions' 
            ORDER BY ordinal_position
        """))
        print("\ncareer_predictions columns:")
        for r in res3.fetchall():
            print(r)

asyncio.run(check())
