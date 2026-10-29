import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.study_plans.service import StudyPlanService

router = APIRouter(prefix="/student/study-plan", tags=["Student Personalized Study Plan"])

class GeneratePlanRequest(BaseModel):
    semester: int = 1

class CompleteItemRequest(BaseModel):
    time_spent_minutes: int = 30

@router.get("")
async def get_study_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = StudyPlanService(db)
    plan = await service.get_or_create_study_plan(current_user.id)
    return {
        "status": "success",
        "data": {
            "id": str(plan.id),
            "semester": plan.semester,
            "status": plan.status,
            "generated_at": plan.generated_at.isoformat(),
            "items": [
                {
                    "id": str(it.id),
                    "day_number": it.day_number,
                    "topic": it.topic,
                    "resource_type": it.resource_type,
                    "resource_url": it.resource_url,
                    "estimated_minutes": it.estimated_minutes,
                    "status": it.status
                }
                for it in plan.items
            ]
        }
    }

@router.post("/generate")
async def generate_plan(
    payload: Optional[GeneratePlanRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = StudyPlanService(db)
    sem = payload.semester if payload else 1
    plan = await service.generate_study_plan(current_user.id, semester=sem)
    return {
        "status": "success",
        "message": "AI personalized study plan generated successfully.",
        "plan_id": str(plan.id),
        "total_days": len(plan.items)
    }

@router.put("/item/{item_id}/complete")
async def complete_plan_item(
    item_id: uuid.UUID,
    payload: Optional[CompleteItemRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = StudyPlanService(db)
    spent = payload.time_spent_minutes if payload else 30
    try:
        res = await service.complete_item(item_id, current_user.id, time_spent=spent)
        return {"status": "success", "data": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/progress")
async def get_plan_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = StudyPlanService(db)
    progress = await service.get_progress(current_user.id)
    return {"status": "success", "data": progress}
