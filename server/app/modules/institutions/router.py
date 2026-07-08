from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.institutions.repository import InstitutionRepository
from app.modules.institutions.schema import (
    DepartmentCreate,
    DepartmentResponse,
    InstitutionCreate,
    InstitutionResponse,
)
from app.modules.users.model import User

router = APIRouter(prefix="/institutions", tags=["Institutions & Departments"])

@router.get("", response_model=list[InstitutionResponse])
async def list_institutions(db: AsyncSession = Depends(get_db)):
    repo = InstitutionRepository(db)
    return await repo.list_institutions()

@router.post("", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def create_institution(
    payload: InstitutionCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = InstitutionRepository(db)
    inst = await repo.create_institution(payload.name, payload.code)
    await db.commit()
    return await repo.get_institution(inst.id)

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = InstitutionRepository(db)
    dept = await repo.create_department(payload.institution_id, payload.name, payload.code)
    await db.commit()
    return dept
