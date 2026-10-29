import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def update():
    async with async_engine.connect() as conn:
        u_res = await conn.execute(text("SELECT id FROM users WHERE full_name = 'Kharizma Vasudev' LIMIT 1"))
        kv_id = u_res.scalar()
        if kv_id:
            await conn.execute(text("UPDATE voice_submissions SET student_id = :sid WHERE student_id NOT IN (SELECT id FROM users WHERE full_name = 'Dharshini R')"), {'sid': kv_id})
            await conn.commit()
            print("Updated successfully to Kharizma Vasudev")

asyncio.run(update())

