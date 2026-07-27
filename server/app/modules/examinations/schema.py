import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator
from app.modules.questions.schema import QuestionResponse

class AssessmentBlueprintCreate(BaseModel):
    subject_id: uuid.UUID
    title: str
    total_marks: float = 100.0
    duration_minutes: int = 120
    easy_pct: int = 30
    medium_pct: int = 50
    hard_pct: int = 20
    unit_distributions: Optional[Any] = None
    bloom_distributions: Optional[Any] = None

class AssessmentBlueprintResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    total_marks: float
    duration_minutes: int
    easy_pct: int
    medium_pct: int
    hard_pct: int
    unit_distributions: Optional[Any] = None
    bloom_distributions: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AddExamQuestionRequest(BaseModel):
    question_id: uuid.UUID
    marks_allocated: float = 5.0
    order_index: int = 0

class ExamQuestionResponse(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    marks: float
    order_index: int
    question: Optional[QuestionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ExaminationCreate(BaseModel):
    subject_id: uuid.UUID
    blueprint_id: Optional[uuid.UUID] = None
    title: str
    exam_type: str = "MID_TERM" # QUIZ, MID_TERM, END_SEMESTER, PRACTICE
    total_marks: float = 100.0
    duration_minutes: int = 120
    start_time: datetime
    end_time: datetime
    is_published: bool = False
    shuffle_questions: bool = True
    shuffle_options: bool = True
    has_negative_marking: bool = False
    target_batch: Optional[str] = None
    target_semester: Optional[int] = None
    target_department_id: Optional[uuid.UUID] = None

    @field_validator("target_batch")
    def check_target_batch(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip():
            from app.core.academic_matrix import ACADEMIC_ANCHOR_MATRIX_2026
            if v.strip() not in ACADEMIC_ANCHOR_MATRIX_2026:
                raise ValueError(f"Invalid target_batch '{v}'. Allowed: {list(ACADEMIC_ANCHOR_MATRIX_2026.keys())}")
            return v.strip()
        return None

    @field_validator("target_semester")
    def check_target_semester(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 8):
            raise ValueError("target_semester must be between 1 and 8")
        return v

class ExaminationResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    blueprint_id: Optional[uuid.UUID] = None
    title: str
    exam_type: str
    total_marks: float
    duration_minutes: int
    start_time: datetime
    end_time: datetime
    is_published: bool
    shuffle_questions: bool
    shuffle_options: bool
    has_negative_marking: bool
    target_batch: Optional[str] = None
    target_semester: Optional[int] = None
    target_department_id: Optional[uuid.UUID] = None
    exam_questions: list[ExamQuestionResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
