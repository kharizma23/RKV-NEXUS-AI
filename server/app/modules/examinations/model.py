import uuid
from datetime import datetime
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.academics.model import Subject, Semester
    from app.modules.questions.model import Question
    from app.modules.users.model import User

class AssessmentBlueprint(Base, TimestampMixin):
    __tablename__ = "assessment_blueprints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=120)
    easy_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    medium_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    hard_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    unit_distributions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. {"unit_1": 40, "unit_2": 60}
    bloom_distributions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. {"APPLY": 50, "ANALYZE": 50}

class Examination(Base, TimestampMixin):
    __tablename__ = "examinations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    blueprint_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("assessment_blueprints.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    exam_type: Mapped[str] = mapped_column(String(50), nullable=False, default="MID_TERM") # QUIZ, MID_TERM, END_SEMESTER, PRACTICE
    total_marks: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=120)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    shuffle_options: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    has_negative_marking: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by_faculty_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("faculty_profiles.id", ondelete="SET NULL"), nullable=True)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    question_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_batch: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    target_semester: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    target_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)

    exam_questions: Mapped[list["ExamQuestion"]] = relationship("ExamQuestion", back_populates="examination", cascade="all, delete-orphan", lazy="selectin")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    marks: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    examination: Mapped["Examination"] = relationship("Examination", back_populates="exam_questions")
    question: Mapped["Question"] = relationship("Question", lazy="selectin")

class ExamAssignment(Base, TimestampMixin):
    __tablename__ = "exam_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="assigned") # assigned, started, completed
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    marks_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    co_attainment: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. {"CO1": 100, "CO2": 80}
    feedback_recommendations: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. ["Review activation functions"]
    question_breakdown: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    examination: Mapped["Examination"] = relationship("Examination", lazy="selectin")
    student: Mapped["User"] = relationship("User", lazy="selectin", foreign_keys=[student_id])
