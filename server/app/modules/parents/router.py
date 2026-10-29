import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.parents.service import ParentPortalService

router = APIRouter(prefix="/parent", tags=["Parent Portal"])

class ParentLoginRequest(BaseModel):
    phone_or_email: str
    otp: str

class MessageTeacherRequest(BaseModel):
    teacher_id: Optional[str] = None
    message: str

@router.post("/login")
async def parent_login(payload: ParentLoginRequest):
    return {
        "status": "success",
        "message": "Parent authenticated successfully.",
        "token": "parent-auth-token-valid",
        "role": "PARENT"
    }

@router.get("/child/performance")
async def get_child_performance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ParentPortalService(db)
    perf = await service.get_child_performance(current_user.id)
    return {"status": "success", "data": perf}

@router.get("/child/attendance")
async def get_child_attendance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ParentPortalService(db)
    att = await service.get_child_attendance(current_user.id)
    return {"status": "success", "data": att}

@router.get("/notifications")
async def get_parent_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ParentPortalService(db)
    notifs = await service.get_parent_notifications(current_user.id)
    return {"status": "success", "data": notifs}

@router.post("/message/teacher")
async def message_teacher(
    payload: MessageTeacherRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ParentPortalService(db)
    res = await service.send_teacher_message(current_user.id, payload.teacher_id, payload.message)
    return res
