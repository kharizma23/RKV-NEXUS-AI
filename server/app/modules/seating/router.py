import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.seating.service import SeatingService

router = APIRouter(tags=["Smart Exam Seating Arrangement"])

class GenerateSeatingRequest(BaseModel):
    exam_id: uuid.UUID
    hall_id: Optional[uuid.UUID] = None

class AddConstraintRequest(BaseModel):
    exam_id: uuid.UUID
    constraint_type: str = "SEPARATE_STUDENTS"
    reason: str
    student_a_id: Optional[uuid.UUID] = None
    student_b_id: Optional[uuid.UUID] = None

@router.get("/seating/halls")
async def get_exam_halls(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SeatingService(db)
    halls = await service.get_or_seed_halls()
    return {
        "status": "success",
        "data": [
            {
                "id": str(h.id),
                "name": h.name,
                "rows": h.rows,
                "columns": h.columns,
                "capacity": h.capacity
            }
            for h in halls
        ]
    }

@router.post("/seating/generate")
async def generate_seating(
    payload: GenerateSeatingRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = SeatingService(db)
    result = await service.generate_seating(payload.exam_id, payload.hall_id)
    return {"status": "success", "message": "Optimal seating arrangement generated", "data": result}

@router.get("/seating/{exam_id}")
async def get_seating_by_exam(
    exam_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SeatingService(db)
    seating = await service.get_seating(exam_id)
    return {"status": "success", "data": seating}

@router.get("/seating/{exam_id}/chart")
async def get_seating_chart(
    exam_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SeatingService(db)
    chart = await service.get_seating_chart(exam_id)
    return {"status": "success", "data": chart}

@router.post("/seating/constraints")
async def add_seating_constraint(
    payload: AddConstraintRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = SeatingService(db)
    constraint = await service.add_constraint(
        exam_id=payload.exam_id,
        constraint_type=payload.constraint_type,
        reason=payload.reason,
        student_a_id=payload.student_a_id,
        student_b_id=payload.student_b_id
    )
    return {
        "status": "success",
        "message": "Seating constraint recorded",
        "data": {
            "id": str(constraint.id),
            "exam_id": str(constraint.exam_id),
            "constraint_type": constraint.constraint_type,
            "reason": constraint.reason
        }
    }
