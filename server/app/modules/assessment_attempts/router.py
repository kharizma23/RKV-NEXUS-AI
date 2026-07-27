import uuid
from typing import List, Optional
from pydantic import BaseModel

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.assessment_attempts.repository import AssessmentAttemptRepository
from app.modules.examinations.repository import ExaminationRepository
from app.modules.assessment_attempts.schema import (
    StudentExamAttemptResponse, SaveAnswerRequest, StudentAnswerResponse
)
from app.modules.users.model import User

router = APIRouter(prefix="/examinations/attempts", tags=["Student Assessment Workspace"])

class StartAttemptBodyRequest(BaseModel):
    examination_id: uuid.UUID

@router.post("/start/{exam_id}", response_model=StudentExamAttemptResponse, status_code=status.HTTP_201_CREATED)
async def start_exam_attempt(
    exam_id: uuid.UUID,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    exam_repo = ExaminationRepository(db)
    attempt_repo = AssessmentAttemptRepository(db)

    exam = await exam_repo.get_examination_by_id(exam_id)
    if not exam:
        raise ValueError("Examination not found")

    # Enforce assignment scope eligibility check if assignments have been configured
    from sqlalchemy import select
    from app.modules.examinations.model import ExamAssignment
    from fastapi import HTTPException
    stmt_any = select(ExamAssignment).where(ExamAssignment.exam_id == exam_id)
    res_any = await db.execute(stmt_any)
    if res_any.scalars().first() is not None:
        stmt_chk = select(ExamAssignment).where(
            ExamAssignment.exam_id == exam_id,
            ExamAssignment.student_id == current_user.id
        )
        res_chk = await db.execute(stmt_chk)
        if not res_chk.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Forbidden: You are not assigned to this examination scope.")

    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    attempt = await attempt_repo.get_or_create_attempt(exam.id, student_id, max_score=exam.total_marks)
    await db.commit()
    return attempt

@router.post("/start", response_model=StudentExamAttemptResponse, status_code=status.HTTP_201_CREATED)
async def start_exam_attempt_body(
    payload: StartAttemptBodyRequest,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    return await start_exam_attempt(payload.examination_id, current_user, db)

@router.post("/{attempt_id}/save-answer", response_model=StudentAnswerResponse)
@router.post("/{attempt_id}/answers", response_model=StudentAnswerResponse)
async def save_answer(
    attempt_id: uuid.UUID,
    payload: SaveAnswerRequest,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AssessmentAttemptRepository(db)
    ans = await repo.save_answer(attempt_id, payload)
    await db.commit()
    return ans

from app.modules.assessment_attempts.service import AssessmentAttemptService
from app.modules.assessment_attempts.schema import SubmitExamAttemptRequest

@router.post("/{attempt_id}/submit", response_model=StudentExamAttemptResponse)
async def submit_exam_attempt(
    attempt_id: uuid.UUID,
    payload: Optional[SubmitExamAttemptRequest] = None,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = AssessmentAttemptService(db)
    attempt = await service.submit_attempt(attempt_id, payload)
    await db.commit()
    return attempt


@router.get("/{attempt_id}", response_model=StudentExamAttemptResponse)
async def get_attempt(
    attempt_id: uuid.UUID,
    current_user: User = Depends(require_roles(["STUDENT", "FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AssessmentAttemptRepository(db)
    attempt = await repo.get_attempt_by_id(attempt_id)
    if not attempt:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Attempt not found")

    user_roles = [r.name for r in current_user.roles] if current_user.roles else []
    if "STUDENT" in user_roles and "ADMIN" not in user_roles and "FACULTY" not in user_roles:
        student_profile_id = current_user.student_profile.id if current_user.student_profile else current_user.id
        if attempt.student_id != student_profile_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Unauthorized access to another student's exam attempt.")

    return attempt
