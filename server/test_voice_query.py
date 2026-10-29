import asyncio
from sqlalchemy import select, desc
from app.database.session import AsyncSessionLocal
from app.modules.voice.model import VoiceSubmission
from app.modules.users.model import User

async def check():
    async with AsyncSessionLocal() as session:
        q = select(VoiceSubmission, User).join(User, VoiceSubmission.student_id == User.id).order_by(desc(VoiceSubmission.created_at))
        rows = (await session.execute(q)).all()
        print(f"Rows count: {len(rows)}")
        for v, u in rows:
            print(f"Submission {v.id}: student={u.full_name}, text={v.transcribed_text[:40]}..., conf={v.confidence_score}")

asyncio.run(check())
