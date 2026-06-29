import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ResourceNotFoundError
from app.modules.audit.repository import AuditRepository
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    async def list_users(self, limit: int = 100, offset: int = 0) -> list[User]:
        return await self.user_repo.list_all_users(limit=limit, offset=offset)

    async def update_user_status(self, user_id: uuid.UUID, is_active: bool, admin_id: uuid.UUID, ip_address: Optional[str] = None) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        updated = await self.user_repo.update_status(user, is_active)
        await self.audit_repo.create(
            action="USER_STATUS_UPDATED",
            resource="User",
            user_id=admin_id,
            details={"target_user_id": str(user_id), "is_active": is_active},
            ip_address=ip_address
        )
        return updated

    async def update_faculty_approval(self, user_id: uuid.UUID, is_approved: bool, admin_id: uuid.UUID, ip_address: Optional[str] = None) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        updated = await self.user_repo.update_faculty_approval(user, is_approved)
        await self.audit_repo.create(
            action="FACULTY_APPROVAL_UPDATED",
            resource="User",
            user_id=admin_id,
            details={"target_user_id": str(user_id), "is_approved": is_approved},
            ip_address=ip_address
        )
        return updated
