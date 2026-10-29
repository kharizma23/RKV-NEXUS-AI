import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship as sa_relationship
from app.database.base import Base

class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    relation_type: Mapped[str] = mapped_column("relationship", String(50), default="PARENT", nullable=False)  # FATHER, MOTHER, GUARDIAN

    user: Mapped["User"] = sa_relationship("User", lazy="selectin")

class ParentStudentMapping(Base):
    __tablename__ = "parent_student_mapping"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("parents.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=True)

    parent: Mapped["Parent"] = sa_relationship("Parent", lazy="selectin")
    student: Mapped["User"] = sa_relationship("User", foreign_keys=[student_id], lazy="selectin")

class ParentNotification(Base):
    __tablename__ = "parent_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("parents.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="ACADEMIC_ALERT", nullable=False)  # ATTENDANCE, EXAM_RESULT, FEE_DUE, ACADEMIC_ALERT
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
