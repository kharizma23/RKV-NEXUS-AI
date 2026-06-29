import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PermissionResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RoleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    permissions: list[PermissionResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
