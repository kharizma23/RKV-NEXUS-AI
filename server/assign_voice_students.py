import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def update_voice():
    async with async_engine.connect() as conn:
        u_res = await conn.execute(text("SELECT id, full_name FROM users WHERE full_name IN ('Dharshini R', 'Kharizma Vasudev')"))
        students = u_res.fetchall()
        print("Found students:", students)

        if len(students) >= 2:
            s1_id = students[0][0]
            s2_id = students[1][0]
            subs = await conn.execute(text("SELECT id FROM voice_submissions ORDER BY created_at DESC LIMIT 2"))
            sub_rows = subs.fetchall()
            if len(sub_rows) >= 2:
                await conn.execute(text("UPDATE voice_submissions SET student_id = :sid WHERE id = :id"), {"sid": s1_id, "id": sub_rows[0][0]})
                await conn.execute(text("UPDATE voice_submissions SET student_id = :sid WHERE id = :id"), {"sid": s2_id, "id": sub_rows[1][0]})
                await conn.commit()
                print("Assigned to Dharshini R and Kharizma Vasudev!")

asyncio.run(update_voice())
