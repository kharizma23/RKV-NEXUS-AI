import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.academics.model import Subject, Programme

class CourseOutcome(Base, TimestampMixin):
    __tablename__ = "course_outcomes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # e.g. CO1, CO2
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    bloom_level: Mapped[str] = mapped_column(String(50), nullable=False, default="APPLY") # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE

    subject: Mapped["Subject"] = relationship("Subject", back_populates="course_outcomes")

class ProgrammeOutcome(Base, TimestampMixin):
    __tablename__ = "programme_outcomes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    programme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # e.g. PO1, PO2
    statement: Mapped[str] = mapped_column(Text, nullable=False)

    programme: Mapped["Programme"] = relationship("Programme", back_populates="programme_outcomes")
