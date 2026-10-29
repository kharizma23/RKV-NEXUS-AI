import uuid
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audit.model import AuditLog


class AuditRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        action: str,
        resource: str,
        user_id: uuid.UUID | None = None,
        details: dict[str, Any] | None = None,
        ip_address: str | None = None
    ) -> AuditLog:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address
        )
        self.session.add(log)
        await self.session.commit()
        await self.session.refresh(log)
        return log

    async def list_recent(self, limit: int = 100, offset: int = 0) -> list[AuditLog]:
        stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
