import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CourseOutcomeResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    code: str
    statement: str
    bloom_level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CourseOutcomeCreate(BaseModel):
    subject_id: uuid.UUID
    code: str
    statement: str
    bloom_level: str = "APPLY"

class ProgrammeOutcomeResponse(BaseModel):
    id: uuid.UUID
    programme_id: uuid.UUID
    code: str
    statement: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProgrammeOutcomeCreate(BaseModel):
    programme_id: uuid.UUID
    code: str
    statement: str
