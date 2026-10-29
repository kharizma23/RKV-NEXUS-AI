import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.calibration.service import CalibrationService

router = APIRouter(tags=["AI Question Difficulty Calibration"])

class CalibrateRequest(BaseModel):
    batch_id: Optional[str] = "BATCH-2026-CSE"

@router.get("/questions/calibration")
async def get_question_calibrations(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = CalibrationService(db)
    calibrations = await service.get_calibrations()
    return {"status": "success", "data": calibrations}

@router.post("/questions/calibrate")
async def run_question_calibration(
    payload: Optional[CalibrateRequest] = None,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = CalibrationService(db)
    batch_id = payload.batch_id if payload else "BATCH-2026-CSE"
    result = await service.calibrate_questions(batch_id)
    return {"status": "success", "message": "Batch question calibration completed", "data": result}

@router.get("/questions/flagged")
async def get_flagged_questions(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = CalibrationService(db)
    flags = await service.get_flagged()
    return {"status": "success", "data": flags}

@router.post("/questions/{id}/replace")
async def replace_question_item(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = CalibrationService(db)
    result = await service.replace_question(id)
    return {"status": "success", "message": "Question replaced with AI calibrated formulation", "data": result}
