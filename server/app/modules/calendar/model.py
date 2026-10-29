import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class AcademicCalendar(Base):
    __tablename__ = "academic_calendar"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(50), default="EXAMINATION", nullable=False)  # EXAMINATION, SYLLABUS_DEADLINE, HOLIDAY, WORKSHOP
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

class CalendarConflict(Base):
    __tablename__ = "calendar_conflicts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_a_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("academic_calendar.id", ondelete="CASCADE"), index=True, nullable=False)
    event_b_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("academic_calendar.id", ondelete="CASCADE"), index=True, nullable=False)
    conflict_type: Mapped[str] = mapped_column(String(100), default="SAME_SLOT_OVERLAP", nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
