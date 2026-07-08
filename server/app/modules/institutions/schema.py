import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    name: str
    code: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InstitutionResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    is_active: bool
    departments: list[DepartmentResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InstitutionCreate(BaseModel):
    name: str
    code: str

class DepartmentCreate(BaseModel):
    institution_id: uuid.UUID
    name: str
    code: str
