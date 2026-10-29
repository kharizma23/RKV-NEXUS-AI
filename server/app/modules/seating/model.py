import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class ExamHall(Base, TimestampMixin):
    __tablename__ = "exam_halls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rows: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    columns: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=36, nullable=False)

    arrangements = relationship("SeatingArrangement", back_populates="hall", cascade="all, delete-orphan", lazy="selectin")

class SeatingArrangement(Base, TimestampMixin):
    __tablename__ = "seating_arrangements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    hall_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_halls.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    column_number: Mapped[int] = mapped_column(Integer, nullable=False)
    seat_label: Mapped[str] = mapped_column(String(20), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    exam = relationship("Examination", foreign_keys=[exam_id], lazy="selectin")
    hall = relationship("ExamHall", back_populates="arrangements", lazy="selectin")
    student = relationship("User", foreign_keys=[student_id], lazy="selectin")

class SeatingConstraint(Base, TimestampMixin):
    __tablename__ = "seating_constraints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    constraint_type: Mapped[str] = mapped_column(String(100), default="SEPARATE_STUDENTS", nullable=False)
    student_a_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    student_b_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
