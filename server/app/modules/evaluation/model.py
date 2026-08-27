import uuid
from datetime import datetime, timezone, UTC
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.assessment_attempts.model import StudentExamAttempt, StudentAnswer
    from app.modules.questions.model import Question

class EvaluationResult(Base, TimestampMixin):
    __tablename__ = "evaluation_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    total_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    grade: Mapped[str] = mapped_column(String(10), nullable=False, default="F") # A+, A, B, C, D, F
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="AUTO_GRADED") # PENDING, AUTO_GRADED, UNDER_REVIEW, PUBLISHED
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    faculty_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    attempt: Mapped["StudentExamAttempt"] = relationship("StudentExamAttempt", lazy="selectin")
    question_evaluations: Mapped[list["QuestionEvaluation"]] = relationship("QuestionEvaluation", back_populates="evaluation_result", cascade="all, delete-orphan", lazy="selectin")

class QuestionEvaluation(Base):
    __tablename__ = "question_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_result_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("evaluation_results.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    ai_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    faculty_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    final_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_score: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    ai_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.9)
    ai_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    matched_key_points: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    missing_key_points: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    rubric_breakdown: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    similarity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    similarity_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    matched_submission_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    faculty_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    is_overridden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    evaluation_result: Mapped["EvaluationResult"] = relationship("EvaluationResult", back_populates="question_evaluations")
    question: Mapped["Question"] = relationship("Question", lazy="selectin")

    @property
    def counterfactual_guidance(self) -> Optional[str]:
        if self.ai_rationale and "✦ Counterfactual Guidance:" in self.ai_rationale:
            return self.ai_rationale.split("✦ Counterfactual Guidance:")[1].strip()
        gap = round(self.max_score - self.final_score, 2)
        if gap > 0:
            return f"If the student had included formal discussion of missing technical invariants and boundary proofs, +{gap} marks would be awarded to reach full {self.max_score}."
        return "Full mastery achieved. All required rubric criteria rigorously satisfied."
