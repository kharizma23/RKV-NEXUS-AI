import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.gamification.service import GamificationService

router = APIRouter(tags=["Student Gamification"])

class AwardPointsRequest(BaseModel):
    student_id: Optional[uuid.UUID] = None
    points: int
    reason: str

class CheckBadgesRequest(BaseModel):
    student_id: Optional[uuid.UUID] = None

@router.get("/student/points")
async def get_points(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GamificationService(db)
    # Also record daily activity for active student
    await service.record_daily_activity(current_user.id)
    summary = await service.get_student_points_summary(current_user.id)
    return {"status": "success", "data": summary}

@router.get("/student/badges")
async def get_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GamificationService(db)
    badges = await service.get_student_badges(current_user.id)
    return {"status": "success", "data": badges}

@router.get("/student/leaderboard")
@router.get("/admin/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GamificationService(db)
    leaderboard = await service.get_leaderboard(department_name=department, limit=limit)
    return {"status": "success", "data": leaderboard}

@router.post("/student/points/award")
async def award_points_endpoint(
    payload: AwardPointsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GamificationService(db)
    target_student_id = payload.student_id or current_user.id
    sp = await service.award_points(target_student_id, payload.points, payload.reason)
    return {
        "status": "success",
        "message": f"Successfully awarded {payload.points} points for '{payload.reason}'",
        "points": sp.points,
        "total_points": sp.total_points
    }

@router.post("/student/badges/check")
async def check_badges_endpoint(
    payload: Optional[CheckBadgesRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GamificationService(db)
    target_student_id = (payload.student_id if payload else None) or current_user.id
    new_badges = await service.check_and_award_badges(target_student_id)
    return {
        "status": "success",
        "newly_awarded_count": len(new_badges),
        "new_badges": [{"name": b.name, "icon": b.icon, "description": b.description} for b in new_badges]
    }
