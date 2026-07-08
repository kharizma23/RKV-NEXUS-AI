import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TopicResponse(BaseModel):
    id: uuid.UUID
    unit_id: uuid.UUID
    topic_number: int
    title: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TopicCreate(BaseModel):
    unit_id: uuid.UUID
    topic_number: int
    title: str
    description: Optional[str] = None

class UnitResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    unit_number: int
    title: str
    description: Optional[str] = None
    weightage: int
    topics: list[TopicResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UnitCreate(BaseModel):
    subject_id: uuid.UUID
    unit_number: int
    title: str
    description: Optional[str] = None
    weightage: int = 20
