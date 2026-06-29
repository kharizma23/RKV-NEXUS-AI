
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.roles.repository import RoleRepository
from app.modules.roles.schema import PermissionResponse, RoleResponse
from app.modules.users.model import User

router = APIRouter(prefix="/roles", tags=["Role & Permission Management"])

@router.get("", response_model=list[RoleResponse])
async def list_roles(
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = RoleRepository(db)
    return await repo.list_roles()

@router.get("/permissions", response_model=list[PermissionResponse])
async def list_permissions(
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = RoleRepository(db)
    return await repo.list_permissions()
