import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.adaptive.service import AdaptiveExamService

router = APIRouter(prefix="/adaptive", tags=["Adaptive Difficulty Exams"])

class StartAdaptiveRequest(BaseModel):
    exam_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None

class SubmitAnswerRequest(BaseModel):
    adaptive_exam_id: uuid.UUID
    question_id: uuid.UUID
    selected_option_id: Optional[uuid.UUID] = None
    answer_text: Optional[str] = None

class SubmitExamRequest(BaseModel):
    adaptive_exam_id: uuid.UUID

@router.post("/start")
async def start_adaptive_exam(
    payload: Optional[StartAdaptiveRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AdaptiveExamService(db)
    exam_id = payload.exam_id if payload else None
    subject_id = payload.subject_id if payload else None
    result = await service.start_adaptive_session(
        student_id=current_user.id,
        exam_id=exam_id,
        subject_id=subject_id
    )
    return {"status": "success", "data": result}

@router.post("/answer")
async def submit_adaptive_answer(
    payload: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AdaptiveExamService(db)
    try:
        result = await service.process_answer(
            adaptive_exam_id=payload.adaptive_exam_id,
            question_id=payload.question_id,
            selected_option_id=payload.selected_option_id,
            answer_text=payload.answer_text
        )
        return {"status": "success", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/progress")
async def get_adaptive_progress(
    adaptive_exam_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AdaptiveExamService(db)
    try:
        progress = await service.get_progress(adaptive_exam_id)
        return {"status": "success", "data": progress}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/submit")
async def submit_adaptive_exam(
    payload: SubmitExamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AdaptiveExamService(db)
    try:
        result = await service.submit_and_complete(payload.adaptive_exam_id)
        return {"status": "success", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
