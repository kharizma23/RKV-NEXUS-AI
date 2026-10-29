import uuid
from datetime import datetime, UTC
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.wellness.service import WellnessService

router = APIRouter(tags=["Student Wellness & Mental Health"])

class WellnessCheckinRequest(BaseModel):
    mood_score: int = Field(..., ge=1, le=10, description="1 (Very Low) to 10 (Excellent)")
    stress_level: int = Field(..., ge=1, le=10, description="1 (Relaxed) to 10 (Extreme Stress)")
    sleep_hours: float = Field(..., ge=0.0, le=24.0)
    notes: Optional[str] = None
    is_anonymous: bool = False

class CounselorScheduleRequest(BaseModel):
    scheduled_at: datetime
    notes: Optional[str] = None
    counselor_id: Optional[uuid.UUID] = None

@router.post("/wellness/checkin")
async def record_wellness_checkin(
    payload: WellnessCheckinRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WellnessService(db)
    res = await service.record_checkin(
        student_id=current_user.id,
        mood_score=payload.mood_score,
        stress_level=payload.stress_level,
        sleep_hours=payload.sleep_hours,
        notes=payload.notes,
        is_anonymous=payload.is_anonymous
    )
    return {"status": "success", "message": "Wellness check-in recorded successfully", "data": res}

@router.get("/wellness/history")
async def get_wellness_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WellnessService(db)
    history = await service.get_history(current_user.id)
    return {"status": "success", "data": history}

@router.get("/wellness/alerts")
async def get_wellness_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WellnessService(db)
    user_roles = [r.name for r in current_user.roles]
    # Admins/Counselors see all alerts; students see their own
    student_id = None if ("ADMIN" in user_roles or "COUNSELOR" in user_roles) else current_user.id
    alerts = await service.get_alerts(student_id)
    return {"status": "success", "data": alerts}

@router.post("/wellness/counselor/schedule")
async def schedule_counselor_session(
    payload: CounselorScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WellnessService(db)
    session = await service.schedule_counselor_session(
        student_id=current_user.id,
        scheduled_at=payload.scheduled_at,
        notes=payload.notes,
        counselor_id=payload.counselor_id
    )
    return {
        "status": "success",
        "message": "Counselor appointment confirmed",
        "data": {
            "session_id": str(session.id),
            "scheduled_at": session.scheduled_at.isoformat(),
            "status": session.status,
            "notes": session.notes
        }
    }

@router.get("/admin/wellness/overview")
@router.get("/wellness/admin/overview")
async def get_admin_wellness_overview(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = WellnessService(db)
    overview = await service.get_admin_overview()
    return {"status": "success", "data": overview}
