import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.learning_outcomes.repository import LearningOutcomesRepository
from app.modules.learning_outcomes.schema import (
    CourseOutcomeResponse, CourseOutcomeCreate, ProgrammeOutcomeResponse, ProgrammeOutcomeCreate
)
from app.modules.users.model import User

router = APIRouter(prefix="/learning-outcomes", tags=["Learning Outcomes"])

@router.get("/cos/{subject_id}", response_model=list[CourseOutcomeResponse])
async def list_course_outcomes(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = LearningOutcomesRepository(db)
    return await repo.list_course_outcomes_by_subject(subject_id)

@router.post("/cos", response_model=CourseOutcomeResponse, status_code=status.HTTP_201_CREATED)
async def create_course_outcome(
    payload: CourseOutcomeCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = LearningOutcomesRepository(db)
    co = await repo.create_course_outcome(payload.subject_id, payload.code, payload.statement, payload.bloom_level)
    await db.commit()
    return co

@router.get("/pos/{programme_id}", response_model=list[ProgrammeOutcomeResponse])
async def list_programme_outcomes(programme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = LearningOutcomesRepository(db)
    return await repo.list_programme_outcomes(programme_id)

@router.post("/pos", response_model=ProgrammeOutcomeResponse, status_code=status.HTTP_201_CREATED)
async def create_programme_outcome(
    payload: ProgrammeOutcomeCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = LearningOutcomesRepository(db)
    po = await repo.create_programme_outcome(payload.programme_id, payload.code, payload.statement)
    await db.commit()
    return po
