import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.institutions.model import Department, Institution


class InstitutionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_institution(self, institution_id: uuid.UUID) -> Institution | None:
        stmt = select(Institution).options(selectinload(Institution.departments)).where(Institution.id == institution_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_institutions(self) -> list[Institution]:
        stmt = select(Institution).options(selectinload(Institution.departments))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_institution(self, name: str, code: str) -> Institution:
        inst = Institution(name=name, code=code.upper())
        self.session.add(inst)
        await self.session.flush()
        return inst

    async def create_department(self, institution_id: uuid.UUID, name: str, code: str) -> Department:
        dept = Department(institution_id=institution_id, name=name, code=code.upper())
        self.session.add(dept)
        await self.session.flush()
        return dept
