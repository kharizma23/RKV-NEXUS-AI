import uuid
from datetime import datetime, UTC
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.calendar.service import CalendarService

router = APIRouter(prefix="/calendar", tags=["Smart Academic Calendar"])

class CreateEventRequest(BaseModel):
    title: str
    event_type: str
    start_date: datetime
    end_date: datetime
    description: Optional[str] = None

class AutoScheduleRequest(BaseModel):
    semester: int = 1

@router.get("/events")
async def get_calendar_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CalendarService(db)
    events = await service.get_events()
    return {
        "status": "success",
        "data": [
            {
                "id": str(e.id),
                "title": e.title,
                "event_type": e.event_type,
                "description": e.description,
                "start_date": e.start_date.isoformat(),
                "end_date": e.end_date.isoformat()
            }
            for e in events
        ]
    }

@router.post("/event")
async def create_calendar_event(
    payload: CreateEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CalendarService(db)
    ev = await service.create_event(
        title=payload.title,
        event_type=payload.event_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        description=payload.description,
        created_by=current_user.id
    )
    return {
        "status": "success",
        "message": "Event created in academic calendar.",
        "event_id": str(ev.id)
    }

@router.post("/auto-schedule")
async def auto_schedule_calendar(
    payload: Optional[AutoScheduleRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CalendarService(db)
    sem = payload.semester if payload else 1
    res = await service.auto_schedule_exams(semester=sem)
    return res

@router.get("/conflicts")
async def get_calendar_conflicts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CalendarService(db)
    conflicts = await service.detect_conflicts()
    return {"status": "success", "data": conflicts, "conflict_count": len(conflicts)}
