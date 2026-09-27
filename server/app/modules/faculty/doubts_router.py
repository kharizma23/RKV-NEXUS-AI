import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User
from app.modules.faculty.doubts_service import FacultyDoubtsService

router = APIRouter(prefix="/faculty", tags=["Faculty Doubts & Bottlenecks Diagnostics"])


@router.get("/doubts/trends")
async def get_doubt_trends(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_trends()


@router.get("/doubts/section-comparison")
async def get_doubt_section_comparison(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_section_comparison()


@router.get("/doubts/stats")
async def get_doubt_stats(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_stats()


@router.get("/doubts/resolved")
async def get_resolved_doubts(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_resolved_doubts()


@router.post("/doubts/generate-intervention-plan")
async def generate_intervention_plan(
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.generate_intervention_plan(current_user.id, payload)


@router.get("/doubts/export")
async def export_doubts(
    format: str = Query("pdf"),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.export_doubts(format)


@router.post("/doubts/export")
async def export_doubts_post(
    payload: Dict[str, Any] = Body(default={}),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    format_type = payload.get("format", "pdf")
    recipients = payload.get("recipients", [])
    service = FacultyDoubtsService(db)
    return await service.export_doubts_with_sharing(format_type, recipients, current_user.id)


@router.get("/remedial/upcoming")
async def get_upcoming_remedials(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_upcoming_remedial_classes(current_user.id)


@router.post("/remedial/schedule", status_code=status.HTTP_201_CREATED)
async def schedule_remedial_class(
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.schedule_remedial_class(current_user.id, payload)


@router.get("/doubts")
async def get_doubts(
    subject_id: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort: Optional[str] = Query("frequency"),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_doubts(
        subject_id=subject_id,
        department_id=department_id,
        semester=semester,
        date_from=date_from,
        date_to=date_to,
        sort=sort
    )


@router.get("/doubts/{id}/details")
async def get_doubt_details(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_doubt_details(id)


@router.get("/doubts/{id}/students")
async def get_affected_students(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.get_affected_students(id)


@router.post("/doubts/{id}/generate-micro-lesson")
async def generate_micro_lesson(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.generate_micro_lesson(id)


@router.post("/doubts/{id}/notify-students")
async def notify_students(
    id: uuid.UUID,
    payload: Dict[str, Any] = Body(default={}),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FacultyDoubtsService(db)
    return await service.notify_students(id, current_user.id, payload)


@router.put("/doubts/{id}/resolve")
async def resolve_doubt(
    id: uuid.UUID,
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    notes = payload.get("resolution_notes", "Marked as resolved after lecture remedial session.")
    service = FacultyDoubtsService(db)
    return await service.resolve_doubt(id, current_user.id, notes)
