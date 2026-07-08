import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.syllabus.repository import SyllabusRepository
from app.modules.syllabus.schema import UnitResponse, UnitCreate, TopicResponse, TopicCreate
from app.modules.users.model import User

router = APIRouter(prefix="/syllabus", tags=["Syllabus Intelligence"])

@router.get("/units/{subject_id}", response_model=list[UnitResponse])
async def list_subject_units(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = SyllabusRepository(db)
    return await repo.list_units_by_subject(subject_id)

@router.post("/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(
    payload: UnitCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = SyllabusRepository(db)
    unit = await repo.create_unit(payload.subject_id, payload.unit_number, payload.title, payload.description, payload.weightage)
    await db.commit()
    return unit

@router.post("/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    payload: TopicCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = SyllabusRepository(db)
    topic = await repo.create_topic(payload.unit_id, payload.topic_number, payload.title, payload.description)
    await db.commit()
    return topic
