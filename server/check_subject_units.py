import asyncio
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        print("--- UNITS BY SUBJECT ---")
        res = await session.execute(text("""
            SELECT s.code, s.name, u.unit_number, u.title 
            FROM units u 
            JOIN subjects s ON u.subject_id = s.id
            ORDER BY s.code, u.unit_number
        """))
        for r in res.fetchall():
            print(r)

        print("\n--- COs BY SUBJECT ---")
        res = await session.execute(text("""
            SELECT s.code, s.name, co.code, co.statement, co.bloom_level 
            FROM course_outcomes co 
            JOIN subjects s ON co.subject_id = s.id
            ORDER BY s.code, co.code
        """))
        for r in res.fetchall():
            print(r)

asyncio.run(check())

