import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.modules.syllabus.schema import TopicResponse

class MisconceptionCatalogResponse(BaseModel):
    id: uuid.UUID
    topic_id: uuid.UUID
    code: str
    title: str
    description: str
    remedial_guidance: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StudentKnowledgeStateResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    topic_id: uuid.UUID
    mastery_level: float
    status: str
    last_updated_at: datetime
    topic: Optional[TopicResponse] = None

    model_config = ConfigDict(from_attributes=True)

class RemedialLearningPlanResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    weak_topics: Optional[Any] = None
    recommended_resources: Optional[Any] = None
    generated_at: datetime
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)

class CourseOutcomeAttainmentResponse(BaseModel):
    co_code: str
    statement: str
    bloom_level: str
    attainment_pct: float
    status: str # MET, ATTAINMENT_GAP
