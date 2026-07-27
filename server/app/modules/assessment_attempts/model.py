import uuid
from datetime import datetime, timezone, UTC
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Float, Integer, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.modules.examinations.model import Examination
    from app.modules.users.model import StudentProfile
    from app.modules.questions.model import Question

class StudentExamAttempt(Base):
    __tablename__ = "student_exam_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="IN_PROGRESS") # IN_PROGRESS, SUBMITTED, EVALUATED
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    tab_switch_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    examination: Mapped["Examination"] = relationship("Examination", lazy="selectin")
    answers: Mapped[list["StudentAnswer"]] = relationship("StudentAnswer", back_populates="attempt", cascade="all, delete-orphan", lazy="selectin")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile", lazy="selectin")

    @property
    def student_name(self) -> str:
        try:
            if self.student_profile and self.student_profile.user:
                return self.student_profile.user.full_name
        except Exception:
            pass
        return "Student"

    @property
    def roll_number(self) -> str:
        try:
            if self.student_profile:
                return getattr(self.student_profile, "student_id_number", "N/A")
        except Exception:
            pass
        return "N/A"

class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_ids: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. ["uuid1", "uuid2"]
    text_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    numerical_response: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_flagged_for_review: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    score_awarded: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evaluator_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    attempt: Mapped["StudentExamAttempt"] = relationship("StudentExamAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", lazy="selectin")
