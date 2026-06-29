import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User
from app.modules.users.schema import FacultyApprovalUpdate, UserResponse, UserStatusUpdate
from app.modules.users.service import UserService

router = APIRouter(prefix="/admin", tags=["User Administration"])

@router.get("/users", response_model=list[UserResponse])
async def list_admin_users(
    limit: int = 100,
    offset: int = 0,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.list_users(limit=limit, offset=offset)

@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    request: Request,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = UserService(db)
    return await service.update_user_status(user_id, payload.is_active, current_admin.id, ip_address=ip)

@router.patch("/faculty/{user_id}/approval", response_model=UserResponse)
async def update_faculty_approval(
    user_id: uuid.UUID,
    payload: FacultyApprovalUpdate,
    request: Request,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = UserService(db)
    return await service.update_faculty_approval(user_id, payload.is_approved, current_admin.id, ip_address=ip)
