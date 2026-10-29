import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def check():
    async with async_engine.connect() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%notif%'"))
        print("Notification tables:", [r[0] for r in res.fetchall()])
        for t in [r[0] for r in res.fetchall()]:
            res = await conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{t}'"))
            print(f"Columns in {t}:", [r[0] for r in res.fetchall()])

asyncio.run(check())
