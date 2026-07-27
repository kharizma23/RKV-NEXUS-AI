import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.modules.questions.schema import QuestionResponse
from app.modules.examinations.schema import ExaminationResponse

class SaveAnswerRequest(BaseModel):
    question_id: uuid.UUID
    selected_option_ids: Optional[list[uuid.UUID]] = None
    text_response: Optional[str] = None
    numerical_response: Optional[float] = None
    is_flagged_for_review: bool = False

class StudentAnswerResponse(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    selected_option_ids: Optional[Any] = None
    text_response: Optional[str] = None
    numerical_response: Optional[float] = None
    is_flagged_for_review: bool
    score_awarded: Optional[float] = None
    evaluator_feedback: Optional[str] = None
    answered_at: datetime
    question: Optional[QuestionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class StudentAnswerSubmit(BaseModel):
    question_id: uuid.UUID
    selected_option_ids: Optional[list[uuid.UUID]] = None
    text_response: Optional[str] = None
    numerical_response: Optional[float] = None
    is_flagged_for_review: bool = False

class SubmitExamAttemptRequest(BaseModel):
    answers: Optional[list[StudentAnswerSubmit]] = None

class StudentExamAttemptResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    student_id: uuid.UUID
    started_at: datetime
    submitted_at: Optional[datetime] = None
    status: str
    score: Optional[float] = None
    max_score: float
    tab_switch_count: int
    examination: Optional[ExaminationResponse] = None
    answers: list[StudentAnswerResponse] = []
    student_name: Optional[str] = None
    roll_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

