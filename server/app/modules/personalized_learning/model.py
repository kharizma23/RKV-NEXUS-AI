import uuid
from datetime import datetime, timezone, UTC
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.syllabus.model import Topic
    from app.modules.academics.model import Subject
    from app.modules.users.model import StudentProfile

class MisconceptionCatalog(Base, TimestampMixin):
    __tablename__ = "misconception_catalogs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # e.g. MIS-DSA-01
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    remedial_guidance: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class StudentKnowledgeState(Base):
    __tablename__ = "student_knowledge_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_level: Mapped[float] = mapped_column(Float, nullable=False, default=0.5) # 0.0 to 1.0
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="DEVELOPING") # WEAK, DEVELOPING, MASTERED
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    topic: Mapped["Topic"] = relationship("Topic", lazy="selectin")

class RemedialLearningPlan(Base, TimestampMixin):
    __tablename__ = "remedial_learning_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    weak_topics: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. [{"topic_id": "...", "title": "..."}]
    recommended_resources: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # e.g. [{"title": "...", "url": "..."}]
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
