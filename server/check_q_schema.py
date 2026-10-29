import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def check():
    async with async_engine.connect() as conn:
        for t in ['questions', 'student_exam_attempts']:
            res = await conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{t}'"))
            print(f"Columns in {t}:", [r[0] for r in res.fetchall()])

asyncio.run(check())
