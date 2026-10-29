import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.two_factor.service import TwoFactorService

router = APIRouter(prefix="/auth/2fa", tags=["Two-Factor Authentication (2FA)"])

class Enable2FARequest(BaseModel):
    method: Optional[str] = "TOTP"

class Verify2FARequest(BaseModel):
    code: str

@router.post("/enable")
async def enable_two_factor(
    payload: Optional[Enable2FARequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TwoFactorService(db)
    method = payload.method if payload else "TOTP"
    result = await service.enable_2fa(current_user.id, method=method)
    return result

@router.post("/verify")
async def verify_two_factor(
    payload: Verify2FARequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TwoFactorService(db)
    is_valid = await service.verify_code(current_user.id, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid 2FA verification code.")
    return {
        "status": "success",
        "message": "Two-factor code verified successfully.",
        "verified": True
    }

@router.post("/disable")
async def disable_two_factor(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TwoFactorService(db)
    disabled = await service.disable_2fa(current_user.id)
    return {
        "status": "success",
        "message": "Two-Factor Authentication disabled.",
        "disabled": disabled
    }

@router.get("/backup-codes")
async def get_backup_codes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TwoFactorService(db)
    codes = await service.get_backup_codes(current_user.id)
    return {"status": "success", "backup_codes": codes}
