import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.dropout.service import DropoutPredictionService

router = APIRouter(tags=["Predictive Dropout Analysis & Interventions"])

class CreateInterventionRequest(BaseModel):
    student_id: uuid.UUID
    intervention_type: str
    description: str
    assigned_to: Optional[str] = None

@router.get("/student/dropout-risk")
async def get_student_dropout_risk(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DropoutPredictionService(db)
    risk = await service.calculate_dropout_risk(current_user.id)
    return {"status": "success", "data": risk}

@router.get("/faculty/dropout-risk/students")
async def get_faculty_dropout_students(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DropoutPredictionService(db)
    students = await service.get_at_risk_students_for_faculty()
    return {"status": "success", "data": students}

@router.get("/admin/dropout-risk/department")
async def get_admin_dropout_department(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DropoutPredictionService(db)
    summary = await service.get_department_dropout_summary()
    return {"status": "success", "data": summary}

@router.post("/interventions/create")
async def create_intervention(
    payload: CreateInterventionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DropoutPredictionService(db)
    intv = await service.create_intervention(
        student_id=payload.student_id,
        intervention_type=payload.intervention_type,
        description=payload.description,
        assigned_to=payload.assigned_to
    )
    return {
        "status": "success",
        "message": "Intervention successfully scheduled.",
        "intervention_id": str(intv.id),
        "status_code": intv.status
    }
