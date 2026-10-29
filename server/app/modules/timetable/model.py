import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Timetable(Base, TimestampMixin):
    __tablename__ = "timetables"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    academic_year: Mapped[str] = mapped_column(String(50), default="2025-2026", nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PUBLISHED", nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    optimization_score: Mapped[float] = mapped_column(Float, default=98.5, nullable=False)

    slots = relationship("TimetableSlot", back_populates="timetable", cascade="all, delete-orphan", lazy="selectin")
    conflicts = relationship("TimetableConflict", back_populates="timetable", cascade="all, delete-orphan", lazy="selectin")

class TimetableSlot(Base, TimestampMixin):
    __tablename__ = "timetable_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timetable_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("timetables.id", ondelete="CASCADE"), index=True, nullable=False)
    day: Mapped[str] = mapped_column(String(20), nullable=False)  # MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)  # "09:00"
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)    # "10:00"
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    faculty_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    room_id: Mapped[str] = mapped_column(String(100), default="LH-101", nullable=False)

    timetable = relationship("Timetable", back_populates="slots", lazy="selectin")
    subject = relationship("Subject", foreign_keys=[subject_id], lazy="selectin")
    faculty = relationship("User", foreign_keys=[faculty_id], lazy="selectin")

class TimetableConflict(Base, TimestampMixin):
    __tablename__ = "timetable_conflicts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timetable_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("timetables.id", ondelete="CASCADE"), index=True, nullable=False)
    conflict_type: Mapped[str] = mapped_column(String(100), nullable=False)  # FACULTY_OVERBOOK, ROOM_OVERBOOK, LOAD_IMBALANCE
    slot_a_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("timetable_slots.id", ondelete="CASCADE"), nullable=False)
    slot_b_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("timetable_slots.id", ondelete="CASCADE"), nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    timetable = relationship("Timetable", back_populates="conflicts", lazy="selectin")
