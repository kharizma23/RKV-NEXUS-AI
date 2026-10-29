import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.vr.service import VRExamService

router = APIRouter(tags=["AR/VR Practical Exam Simulations"])

class CreateVRExamRequest(BaseModel):
    title: str
    vr_scene_url: str
    duration_minutes: int = 45
    description: Optional[str] = None
    experiment_type: str = "PHYSICS_OPTICS"
    subject_id: Optional[uuid.UUID] = None

class StartVRAttemptRequest(BaseModel):
    vr_exam_id: uuid.UUID

class SubmitVRAttemptRequest(BaseModel):
    attempt_id: uuid.UUID
    interaction_log: Optional[Dict[str, Any]] = None

@router.get("/vr/exams")
async def get_vr_exams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    exams = await service.get_or_seed_vr_exams()
    return {
        "status": "success",
        "data": [
            {
                "id": str(e.id),
                "title": e.title,
                "description": e.description,
                "vr_scene_url": e.vr_scene_url,
                "duration_minutes": e.duration_minutes,
                "experiment_type": e.experiment_type,
                "subject_id": str(e.subject_id) if e.subject_id else None
            }
            for e in exams
        ]
    }

@router.get("/vr/exams/{id}")
async def get_vr_exam_by_id(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    exam = await service.get_exam_by_id(id)
    return {
        "status": "success",
        "data": {
            "id": str(exam.id),
            "title": exam.title,
            "description": exam.description,
            "vr_scene_url": exam.vr_scene_url,
            "duration_minutes": exam.duration_minutes,
            "experiment_type": exam.experiment_type,
            "subject_id": str(exam.subject_id) if exam.subject_id else None
        }
    }

@router.post("/vr/exams")
async def create_vr_exam(
    payload: CreateVRExamRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    exam = await service.create_exam(
        title=payload.title,
        vr_scene_url=payload.vr_scene_url,
        duration_minutes=payload.duration_minutes,
        description=payload.description,
        experiment_type=payload.experiment_type,
        subject_id=payload.subject_id,
        created_by=current_user.id
    )
    return {"status": "success", "message": "VR Exam scene created", "data": {"id": str(exam.id)}}

@router.post("/vr/attempt/start")
async def start_vr_attempt(
    payload: StartVRAttemptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    attempt = await service.start_attempt(payload.vr_exam_id, current_user.id)
    return {
        "status": "success",
        "message": "VR simulation session initialized",
        "data": {
            "attempt_id": str(attempt.id),
            "vr_exam_id": str(attempt.vr_exam_id),
            "started_at": attempt.started_at.isoformat()
        }
    }

@router.post("/vr/attempt/submit")
async def submit_vr_attempt(
    payload: SubmitVRAttemptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    res = await service.submit_attempt(payload.attempt_id, payload.interaction_log)
    return {"status": "success", "message": "VR attempt evaluated successfully", "data": res}

@router.get("/vr/attempt/results")
async def get_vr_results(
    exam_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VRExamService(db)
    results = await service.get_results(current_user.id, exam_id)
    return {"status": "success", "data": results}
