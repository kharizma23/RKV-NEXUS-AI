import uuid
from datetime import datetime, UTC
from typing import Optional, List
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, ARCHIVED

    items: Mapped[list["StudyPlanItem"]] = relationship("StudyPlanItem", back_populates="plan", cascade="all, delete-orphan", lazy="selectin")

class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("study_plans.id", ondelete="CASCADE"), index=True, nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), default="PRACTICE_QUIZ", nullable=False)  # VIDEO, READING, PRACTICE_QUIZ, CODING
    resource_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # PENDING, IN_PROGRESS, COMPLETED

    plan: Mapped["StudyPlan"] = relationship("StudyPlan", back_populates="items")

class StudyPlanProgress(Base):
    __tablename__ = "study_plan_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("study_plans.id", ondelete="CASCADE"), index=True, nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("study_plan_items.id", ondelete="CASCADE"), index=True, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    time_spent_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
