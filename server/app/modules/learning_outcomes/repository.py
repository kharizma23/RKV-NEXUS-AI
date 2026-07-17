import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.learning_outcomes.model import CourseOutcome, ProgrammeOutcome

class LearningOutcomesRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_course_outcome(self, subject_id: uuid.UUID, code: str, statement: str, bloom_level: str = "APPLY") -> CourseOutcome:
        co = CourseOutcome(subject_id=subject_id, code=code.upper(), statement=statement, bloom_level=bloom_level.upper())
        self.session.add(co)
        await self.session.flush()
        return co

    async def list_course_outcomes_by_subject(self, subject_id: uuid.UUID) -> list[CourseOutcome]:
        stmt = select(CourseOutcome).where(CourseOutcome.subject_id == subject_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_programme_outcome(self, programme_id: uuid.UUID, code: str, statement: str) -> ProgrammeOutcome:
        po = ProgrammeOutcome(programme_id=programme_id, code=code.upper(), statement=statement)
        self.session.add(po)
        await self.session.flush()
        return po

    async def list_programme_outcomes(self, programme_id: uuid.UUID) -> list[ProgrammeOutcome]:
        stmt = select(ProgrammeOutcome).where(ProgrammeOutcome.programme_id == programme_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
