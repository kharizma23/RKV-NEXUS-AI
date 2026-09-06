import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.personalized_learning.repository import PersonalizedLearningRepository
from app.modules.personalized_learning.service import PersonalizedLearningService
from app.modules.personalized_learning.schema import (
    StudentKnowledgeStateResponse, RemedialLearningPlanResponse, CourseOutcomeAttainmentResponse
)
from app.modules.users.model import User

router = APIRouter(tags=["Personalized Learning & AI Misconception Engine"])

@router.get("/learning-plan/my", response_model=Optional[RemedialLearningPlanResponse])
@router.get("/personalized-learning/my-plan", response_model=Optional[RemedialLearningPlanResponse])
@router.get("/my-plan", response_model=Optional[RemedialLearningPlanResponse])
async def get_my_remedial_plan(
    subject_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = PersonalizedLearningService(db)
    repo = PersonalizedLearningRepository(db)
    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    
    plan = await repo.get_latest_remedial_plan(student_id, subject_id)
    if not plan and subject_id:
        plan = await service.generate_remedial_plan(student_id, subject_id)
    return plan

@router.post("/learning-plan/generate/{subject_id}", response_model=RemedialLearningPlanResponse, status_code=status.HTTP_201_CREATED)
async def generate_remedial_plan(
    subject_id: uuid.UUID,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = PersonalizedLearningService(db)
    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    return await service.generate_remedial_plan(student_id, subject_id)

@router.get("/learning-plan/knowledge-states", response_model=list[StudentKnowledgeStateResponse])
async def list_knowledge_states(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    repo = PersonalizedLearningRepository(db)
    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    return await repo.list_student_knowledge_states(student_id)

@router.get("/analytics/co-attainment/{subject_id}", response_model=list[CourseOutcomeAttainmentResponse])
@router.get("/personalized-learning/co-attainment/{subject_id}", response_model=list[CourseOutcomeAttainmentResponse])
@router.get("/co-attainment/{subject_id}", response_model=list[CourseOutcomeAttainmentResponse])
async def get_co_attainment_analytics(
    subject_id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = PersonalizedLearningService(db)
    return await service.calculate_co_attainment(subject_id)
