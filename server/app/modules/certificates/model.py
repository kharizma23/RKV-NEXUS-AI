import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Certificate(Base, TimestampMixin):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id", ondelete="SET NULL"), nullable=True, index=True)
    certificate_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(66), nullable=False)
    block_number: Mapped[int] = mapped_column(Integer, default=48921820, nullable=False)
    network: Mapped[str] = mapped_column(String(50), default="Polygon Amoy Testnet", nullable=False)
    contract_address: Mapped[str] = mapped_column(String(66), default="0x71C95911E9a5D330f4D621842EC243EE1343292e", nullable=False)
    qr_code_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revocation_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
    programme = relationship("Programme", foreign_keys=[programme_id], lazy="selectin")
    verifications = relationship("CertificateVerification", back_populates="certificate", cascade="all, delete-orphan", lazy="selectin")

class CertificateVerification(Base, TimestampMixin):
    __tablename__ = "certificate_verifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certificate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("certificates.id", ondelete="CASCADE"), index=True, nullable=False)
    verified_by: Mapped[str] = mapped_column(String(255), default="Public Employer / Recruiter", nullable=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), default="127.0.0.1", nullable=False)

    certificate = relationship("Certificate", back_populates="verifications", lazy="selectin")
