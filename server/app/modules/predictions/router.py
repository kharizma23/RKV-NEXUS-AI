import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.predictions.service import PredictionService

router = APIRouter(tags=["Student Performance Predictions"])

@router.get("/student/prediction")
async def get_student_prediction(
    semester: int = 1,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(db)
    prediction = await service.predict_student_performance(current_user.id, semester=semester)
    return {"status": "success", "data": prediction}

@router.get("/faculty/predictions/at-risk")
async def get_faculty_at_risk_predictions(
    limit: int = 15,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(db)
    at_risk = await service.get_faculty_at_risk_predictions(limit=limit)
    return {"status": "success", "data": at_risk}

@router.get("/admin/predictions/department")
async def get_admin_department_predictions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(db)
    dept_summary = await service.get_department_predictions_summary()
    return {"status": "success", "data": dept_summary}
