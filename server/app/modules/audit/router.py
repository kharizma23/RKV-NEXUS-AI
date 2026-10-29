
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.audit.repository import AuditRepository
from app.modules.audit.schema import AuditLogResponse
from app.modules.users.model import User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logging"])

@router.get("", response_model=list[AuditLogResponse])
async def list_audit_logs(
    limit: int = 100,
    offset: int = 0,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = AuditRepository(db)
    return await repo.list_recent(limit=limit, offset=offset)
