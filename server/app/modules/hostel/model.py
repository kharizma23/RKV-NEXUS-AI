import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Hostel(Base, TimestampMixin):
    __tablename__ = "hostels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="MENS", nullable=False)  # MENS, WOMENS, COED
    total_rooms: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    warden_name: Mapped[str] = mapped_column(String(100), default="Dr. K. Ramanathan", nullable=False)
    contact_number: Mapped[str] = mapped_column(String(50), default="+91 98401 23456", nullable=False)

    rooms = relationship("HostelRoom", back_populates="hostel", cascade="all, delete-orphan", lazy="selectin")

class HostelRoom(Base, TimestampMixin):
    __tablename__ = "hostel_rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hostel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hostels.id", ondelete="CASCADE"), index=True, nullable=False)
    room_number: Mapped[str] = mapped_column(String(50), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    occupied: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    hostel = relationship("Hostel", back_populates="rooms", lazy="selectin")
    allocations = relationship("HostelAllocation", back_populates="room", cascade="all, delete-orphan", lazy="selectin")

class HostelAllocation(Base, TimestampMixin):
    __tablename__ = "hostel_allocations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    room_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hostel_rooms.id", ondelete="CASCADE"), index=True, nullable=False)
    allocated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    vacated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ALLOCATED", nullable=False)  # ALLOCATED, VACATED, CANCELLED

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
    room = relationship("HostelRoom", back_populates="allocations", lazy="selectin")

class HostelComplaint(Base, TimestampMixin):
    __tablename__ = "hostel_complaints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    room_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("hostel_rooms.id", ondelete="SET NULL"), nullable=True)
    complaint_type: Mapped[str] = mapped_column(String(100), default="MAINTENANCE", nullable=False)  # MAINTENANCE, PLUMBING, ELECTRICAL, HYGIENE, NOISE
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # PENDING, IN_PROGRESS, RESOLVED, CLOSED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
    room = relationship("HostelRoom", foreign_keys=[room_id], lazy="selectin")
