import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.syllabus.model import Unit, Topic

class SyllabusRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_unit(self, subject_id: uuid.UUID, unit_number: int, title: str, description: Optional[str] = None, weightage: int = 20) -> Unit:
        unit = Unit(subject_id=subject_id, unit_number=unit_number, title=title, description=description, weightage=weightage)
        self.session.add(unit)
        await self.session.flush()
        stmt = select(Unit).options(selectinload(Unit.topics)).where(Unit.id == unit.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def list_units_by_subject(self, subject_id: uuid.UUID) -> list[Unit]:
        stmt = select(Unit).options(selectinload(Unit.topics)).where(Unit.subject_id == subject_id).order_by(Unit.unit_number)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_topic(self, unit_id: uuid.UUID, topic_number: int, title: str, description: Optional[str] = None) -> Topic:
        topic = Topic(unit_id=unit_id, topic_number=topic_number, title=title, description=description)
        self.session.add(topic)
        await self.session.flush()
        return topic
