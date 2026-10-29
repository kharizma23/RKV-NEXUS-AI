import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class FeeStructure(Base, TimestampMixin):
    __tablename__ = "fee_structures"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id", ondelete="SET NULL"), nullable=True)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fee_head: Mapped[str] = mapped_column(String(100), default="Tuition & Examination Fee", nullable=False)

    programme = relationship("Programme", foreign_keys=[programme_id], lazy="selectin")
    payments = relationship("FeePayment", back_populates="fee_structure", cascade="all, delete-orphan", lazy="selectin")
    reminders = relationship("FeeReminder", back_populates="fee_structure", cascade="all, delete-orphan", lazy="selectin")

class FeePayment(Base, TimestampMixin):
    __tablename__ = "fee_payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    fee_structure_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("fee_structures.id", ondelete="CASCADE"), index=True, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    payment_mode: Mapped[str] = mapped_column(String(50), default="UPI", nullable=False)
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS", nullable=False)

    fee_structure = relationship("FeeStructure", back_populates="payments", lazy="selectin")
    student = relationship("User", foreign_keys=[student_id], lazy="selectin")

class FeeReminder(Base, TimestampMixin):
    __tablename__ = "fee_reminders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    fee_structure_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("fee_structures.id", ondelete="CASCADE"), index=True, nullable=False)
    reminder_type: Mapped[str] = mapped_column(String(50), default="EMAIL", nullable=False)  # EMAIL, SMS, WHATSAPP, SYSTEM
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SENT", nullable=False)

    fee_structure = relationship("FeeStructure", back_populates="reminders", lazy="selectin")
    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
