import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class QuestionOptionCreate(BaseModel):
    option_text: str
    is_correct: bool = False
    order_index: int = 0

class QuestionOptionResponse(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    option_text: str
    is_correct: bool
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class QuestionCreate(BaseModel):
    subject_id: uuid.UUID
    unit_id: Optional[uuid.UUID] = None
    topic_id: Optional[uuid.UUID] = None
    co_id: Optional[uuid.UUID] = None
    question_type: str = "MCQ" # MCQ, MULTI_SELECT, SHORT_ANSWER, NUMERICAL, DESCRIPTIVE
    prompt: str
    explanation: Optional[str] = None
    difficulty: str = "MEDIUM" # EASY, MEDIUM, HARD
    bloom_level: str = "APPLY" # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    default_marks: float = 2.0
    negative_marks: float = 0.0
    rubric: Optional[str] = None
    options: list[QuestionOptionCreate] = []

class QuestionResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    unit_id: Optional[uuid.UUID] = None
    topic_id: Optional[uuid.UUID] = None
    co_id: Optional[uuid.UUID] = None
    question_type: str
    prompt: str
    explanation: Optional[str] = None
    difficulty: str
    bloom_level: str
    default_marks: float
    negative_marks: float
    rubric: Optional[str] = None
    options: list[QuestionOptionResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
