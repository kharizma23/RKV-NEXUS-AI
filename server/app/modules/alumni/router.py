import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.alumni.service import AlumniService

router = APIRouter(tags=["Alumni Performance & Curriculum Mapping"])

class RegisterAlumniRequest(BaseModel):
    graduation_year: int
    current_company: str
    job_role: str
    package: float
    linkedin_url: Optional[str] = None
    domain: Optional[str] = "SOFTWARE_DEVELOPMENT"
    feedback_notes: Optional[str] = None

@router.get("/alumni")
async def get_alumni_directory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AlumniService(db)
    alumni = await service.get_or_seed_alumni()
    return {
        "status": "success",
        "data": [
            {
                "id": str(a.id),
                "student_id": str(a.student_id),
                "name": a.student.full_name if a.student else "Alumni",
                "graduation_year": a.graduation_year,
                "current_company": a.current_company,
                "job_role": a.job_role,
                "package": a.package,
                "domain": a.domain,
                "linkedin_url": a.linkedin_url
            }
            for a in alumni
        ]
    }

@router.get("/alumni/{id}")
async def get_alumni_by_id(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AlumniService(db)
    details = await service.get_alumni_by_id(id)
    return {"status": "success", "data": details}

@router.post("/alumni/register")
async def register_alumni(
    payload: RegisterAlumniRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AlumniService(db)
    alumni = await service.register_alumni(
        student_id=current_user.id,
        graduation_year=payload.graduation_year,
        current_company=payload.current_company,
        job_role=payload.job_role,
        package=payload.package,
        linkedin_url=payload.linkedin_url,
        domain=payload.domain or "SOFTWARE_DEVELOPMENT",
        feedback_notes=payload.feedback_notes
    )
    return {
        "status": "success",
        "message": "Alumni profile registered successfully",
        "data": {
            "id": str(alumni.id),
            "current_company": alumni.current_company,
            "job_role": alumni.job_role,
            "package": alumni.package
        }
    }

@router.get("/admin/alumni/analytics")
@router.get("/alumni/admin/analytics")
async def get_alumni_analytics(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = AlumniService(db)
    analytics = await service.get_analytics()
    return {"status": "success", "data": analytics}

@router.get("/admin/alumni/co-mapping")
@router.get("/alumni/admin/co-mapping")
async def get_alumni_co_mapping(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = AlumniService(db)
    co_map = await service.get_co_mapping()
    return {"status": "success", "data": co_map}
