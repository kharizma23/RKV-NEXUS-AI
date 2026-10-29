import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.certificates.service import CertificateService

router = APIRouter(tags=["Blockchain Certificate Verification"])

class IssueCertificateRequest(BaseModel):
    student_id: uuid.UUID
    programme_id: Optional[uuid.UUID] = None
    custom_metadata: Optional[Dict[str, Any]] = None

class RevokeCertificateRequest(BaseModel):
    reason: Optional[str] = "Administrative review revocation"

@router.post("/certificates/issue")
async def issue_certificate(
    payload: IssueCertificateRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    cert = await service.issue_certificate(
        student_id=payload.student_id,
        programme_id=payload.programme_id,
        custom_metadata=payload.custom_metadata
    )
    return {
        "status": "success",
        "message": "Certificate issued and anchored to Polygon blockchain",
        "data": {
            "id": str(cert.id),
            "certificate_hash": cert.certificate_hash,
            "blockchain_tx_hash": cert.blockchain_tx_hash,
            "block_number": cert.block_number,
            "network": cert.network,
            "issued_at": cert.issued_at.isoformat()
        }
    }

@router.get("/certificates/verify/{hash}")
async def verify_certificate(
    hash: str,
    request: Request,
    verified_by: Optional[str] = "Public Verifier / Recruiter",
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    client_ip = request.client.host if request.client else "127.0.0.1"
    res = await service.verify_certificate(
        cert_hash=hash,
        verified_by=verified_by or "Public Verifier",
        ip_address=client_ip
    )
    return {"status": "success", "data": res}

@router.get("/student/certificates")
@router.get("/certificates/student")
async def get_student_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    certs = await service.get_student_certificates(current_user.id)
    return {
        "status": "success",
        "data": [
            {
                "id": str(c.id),
                "certificate_hash": c.certificate_hash,
                "blockchain_tx_hash": c.blockchain_tx_hash,
                "block_number": c.block_number,
                "network": c.network,
                "contract_address": c.contract_address,
                "qr_code_data": c.qr_code_data,
                "metadata": c.metadata_json,
                "issued_at": c.issued_at.isoformat() if c.issued_at else None,
                "is_valid": c.revoked_at is None,
                "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None,
                "revocation_reason": c.revocation_reason
            }
            for c in certs
        ]
    }

@router.post("/certificates/revoke/{id}")
async def revoke_certificate(
    id: uuid.UUID,
    payload: Optional[RevokeCertificateRequest] = None,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    reason = payload.reason if payload and payload.reason else "Administrative revocation"
    cert = await service.revoke_certificate(id, reason)
    return {
        "status": "success",
        "message": "Certificate successfully revoked",
        "data": {
            "id": str(cert.id),
            "certificate_hash": cert.certificate_hash,
            "revoked_at": cert.revoked_at.isoformat() if cert.revoked_at else None,
            "revocation_reason": cert.revocation_reason
        }
    }
