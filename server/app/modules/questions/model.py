import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.academics.model import Subject
    from app.modules.syllabus.model import Unit, Topic
    from app.modules.learning_outcomes.model import CourseOutcome

class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="SET NULL"), nullable=True, index=True)
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    co_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("course_outcomes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    question_type: Mapped[str] = mapped_column(String(50), nullable=False, default="MCQ") # MCQ, MULTI_SELECT, SHORT_ANSWER, NUMERICAL, DESCRIPTIVE
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM") # EASY, MEDIUM, HARD
    bloom_level: Mapped[str] = mapped_column(String(50), nullable=False, default="APPLY") # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    default_marks: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    negative_marks: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    rubric: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by_faculty_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("faculty_profiles.id", ondelete="SET NULL"), nullable=True)

    options: Mapped[list["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", lazy="selectin")

class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    question: Mapped["Question"] = relationship("Question", back_populates="options")
