import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.academics.model import Subject

class Unit(Base, TimestampMixin):
    __tablename__ = "units"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weightage: Mapped[int] = mapped_column(Integer, nullable=False, default=20)

    subject: Mapped["Subject"] = relationship("Subject", back_populates="units")
    topics: Mapped[list["Topic"]] = relationship("Topic", back_populates="unit", cascade="all, delete-orphan", lazy="selectin")

class Topic(Base, TimestampMixin):
    __tablename__ = "topics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    unit: Mapped["Unit"] = relationship("Unit", back_populates="topics")
