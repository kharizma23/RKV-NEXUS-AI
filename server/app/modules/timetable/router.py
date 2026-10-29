import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.timetable.service import TimetableService

router = APIRouter(tags=["AI-Powered Academic Timetable Generator"])

class GenerateTimetableRequest(BaseModel):
    semester: int = 1
    academic_year: str = "2025-2026"

class ResolveConflictRequest(BaseModel):
    conflict_id: uuid.UUID
    resolution_notes: Optional[str] = "Manual faculty reschedule applied"

@router.post("/timetable/generate")
async def generate_timetable(
    payload: Optional[GenerateTimetableRequest] = None,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    sem = payload.semester if payload else 1
    ay = payload.academic_year if payload else "2025-2026"
    tt = await service.generate_timetable(semester=sem, academic_year=ay)
    return {
        "status": "success",
        "message": "Conflict-free timetable generated and optimized",
        "data": {
            "id": str(tt.id),
            "semester": tt.semester,
            "academic_year": tt.academic_year,
            "status": tt.status,
            "optimization_score": tt.optimization_score
        }
    }

@router.get("/timetable/active")
async def get_active_timetable(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    tt = await service.generate_timetable(semester=1)
    res = await service.get_timetable_by_id(tt.id)
    return {"status": "success", "data": res}

@router.get("/timetable/{id}")
async def get_timetable_by_id(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    res = await service.get_timetable_by_id(id)
    return {"status": "success", "data": res}

@router.get("/timetable/{id}/faculty")
async def get_faculty_timetable(
    id: uuid.UUID,
    faculty_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    slots = await service.get_faculty_timetable(id, faculty_id)
    return {"status": "success", "data": slots}

@router.get("/timetable/{id}/room")
async def get_room_schedule(
    id: uuid.UUID,
    room_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    slots = await service.get_room_schedule(id, room_id)
    return {"status": "success", "data": slots}

@router.post("/timetable/resolve-conflict")
async def resolve_timetable_conflict(
    payload: ResolveConflictRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = TimetableService(db)
    res = await service.resolve_conflict(payload.conflict_id, payload.resolution_notes)
    return {"status": "success", "message": "Timetable conflict resolved", "data": res}
