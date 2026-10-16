import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Text, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class PlagiarismCheck(Base):
    __tablename__ = "plagiarism_checks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    matched_sources: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    sources: Mapped[list["PlagiarismSource"]] = relationship("PlagiarismSource", back_populates="check", cascade="all, delete-orphan", lazy="selectin")

class PlagiarismSource(Base):
    __tablename__ = "plagiarism_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    check_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plagiarism_checks.id", ondelete="CASCADE"), index=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), default="PEER_SUBMISSION", nullable=False)  # PEER_SUBMISSION, INTERNET, ACADEMIC_PAPER
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    similarity_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    check: Mapped["PlagiarismCheck"] = relationship("PlagiarismCheck", back_populates="sources")
