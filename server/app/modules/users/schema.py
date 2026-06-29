import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class StudentProfileResponse(BaseModel):
    id: uuid.UUID
    student_id_number: str
    department_id: uuid.UUID | None = None

    model_config = ConfigDict(from_attributes=True)

class FacultyProfileResponse(BaseModel):
    id: uuid.UUID
    employee_id: str
    designation: str | None = None
    department_id: uuid.UUID | None = None

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    is_approved: bool
    roles: list[str] = []
    student_profile: StudentProfileResponse | None = None
    faculty_profile: FacultyProfileResponse | None = None
    created_at: datetime

    @field_validator("roles", mode="before")
    def convert_roles(cls, v: Any) -> list[str]:
        if isinstance(v, list):
            result = []
            for item in v:
                if hasattr(item, "name"):
                    result.append(item.name)
                elif isinstance(item, str):
                    result.append(item)
                else:
                    result.append(str(item))
            return result
        return []

    model_config = ConfigDict(from_attributes=True)

class UserStatusUpdate(BaseModel):
    is_active: bool

class FacultyApprovalUpdate(BaseModel):
    is_approved: bool
