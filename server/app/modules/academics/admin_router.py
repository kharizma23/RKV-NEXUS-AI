import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.academics.repository import AcademicsRepository
from app.modules.academics.schema import (
    ProgrammeCreate,
    ProgrammeResponse,
    ProgrammeStudentResponse,
    ProgrammeTemplateResponse,
    ProgrammeUpdate,
)
from app.modules.academics.templates import PROGRAMME_TEMPLATES
from app.modules.audit.repository import AuditRepository
from app.modules.users.model import User

router = APIRouter(prefix="/admin/programmes", tags=["Admin Programme Management"])


@router.get("/templates", response_model=list[ProgrammeTemplateResponse])
async def get_programme_templates():
    return PROGRAMME_TEMPLATES


@router.get("", response_model=list[ProgrammeResponse])
async def list_admin_programmes(
    institution_id: Optional[uuid.UUID] = Query(None),
    department_id: Optional[uuid.UUID] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    programmes = await repo.list_programmes(
        institution_id=institution_id,
        department_id=department_id,
        is_active=is_active,
    )
    result = []
    for p in programmes:
        count_students = await repo.get_enrolled_students_count(p.id)
        result.append(
            ProgrammeResponse(
                id=p.id,
                institution_id=p.institution_id,
                department_id=p.department_id,
                name=p.name,
                programme_name=p.name,
                code=p.code,
                programme_code=p.code,
                degree_type=p.degree_type,
                duration_years=p.duration_years,
                total_semesters=p.total_semesters,
                regulation_name=p.regulation_name,
                description=p.description,
                is_active=p.is_active,
                created_by=p.created_by,
                institution_name=p.institution.name if p.institution else None,
                department_name=p.department.name if p.department else None,
                enrolled_students_count=count_students,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return result


@router.post("", response_model=ProgrammeResponse, status_code=status.HTTP_201_CREATED)
async def create_programme(
    payload: ProgrammeCreate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    audit_repo = AuditRepository(db)

    try:
        prog = await repo.create_programme(
            institution_id=payload.institution_id,
            department_id=payload.department_id,
            name=payload.name or payload.programme_name or "",
            code=payload.code or payload.programme_code or "",
            degree_type=payload.degree_type,
            duration_years=payload.duration_years,
            total_semesters=payload.total_semesters,
            regulation_name=payload.regulation_name,
            description=payload.description,
            is_active=payload.is_active,
            created_by=current_admin.id,
            auto_create_semesters=payload.auto_create_semesters,
            confirm_unusual_name=payload.confirm_unusual_name,
        )

        await audit_repo.create(
            action="PROGRAMME_CREATED",
            resource="Programme",
            user_id=current_admin.id,
            details={
                "programme_id": str(prog.id),
                "programme_name": prog.name,
                "programme_code": prog.code,
                "institution_id": str(prog.institution_id),
                "department_id": str(prog.department_id),
                "auto_create_semesters": payload.auto_create_semesters,
            },
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise e

    count_students = await repo.get_enrolled_students_count(prog.id)
    return ProgrammeResponse(
        id=prog.id,
        institution_id=prog.institution_id,
        department_id=prog.department_id,
        name=prog.name,
        programme_name=prog.name,
        code=prog.code,
        programme_code=prog.code,
        degree_type=prog.degree_type,
        duration_years=prog.duration_years,
        total_semesters=prog.total_semesters,
        regulation_name=prog.regulation_name,
        description=prog.description,
        is_active=prog.is_active,
        created_by=prog.created_by,
        institution_name=prog.institution.name if prog.institution else None,
        department_name=prog.department.name if prog.department else None,
        enrolled_students_count=count_students,
        created_at=prog.created_at,
        updated_at=prog.updated_at,
    )


@router.get("/{programme_id}", response_model=ProgrammeResponse)
async def get_programme(
    programme_id: uuid.UUID,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    prog = await repo.get_programme_by_id(programme_id)
    if not prog:
        from app.core.exceptions import ResourceNotFoundError
        raise ResourceNotFoundError("Programme")

    count_students = await repo.get_enrolled_students_count(prog.id)
    return ProgrammeResponse(
        id=prog.id,
        institution_id=prog.institution_id,
        department_id=prog.department_id,
        name=prog.name,
        programme_name=prog.name,
        code=prog.code,
        programme_code=prog.code,
        degree_type=prog.degree_type,
        duration_years=prog.duration_years,
        total_semesters=prog.total_semesters,
        regulation_name=prog.regulation_name,
        description=prog.description,
        is_active=prog.is_active,
        created_by=prog.created_by,
        institution_name=prog.institution.name if prog.institution else None,
        department_name=prog.department.name if prog.department else None,
        enrolled_students_count=count_students,
        created_at=prog.created_at,
        updated_at=prog.updated_at,
    )


@router.patch("/{programme_id}", response_model=ProgrammeResponse)
async def update_programme(
    programme_id: uuid.UUID,
    payload: ProgrammeUpdate,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    audit_repo = AuditRepository(db)

    old_prog = await repo.get_programme_by_id(programme_id)
    if not old_prog:
        from app.core.exceptions import ResourceNotFoundError
        raise ResourceNotFoundError("Programme")

    old_dept_id = str(old_prog.department_id)

    try:
        updated = await repo.update_programme(
            programme_id=programme_id,
            institution_id=payload.institution_id,
            department_id=payload.department_id,
            name=payload.name,
            code=payload.code,
            degree_type=payload.degree_type,
            duration_years=payload.duration_years,
            total_semesters=payload.total_semesters,
            regulation_name=payload.regulation_name,
            description=payload.description,
            is_active=payload.is_active,
            confirm_unusual_name=payload.confirm_unusual_name or False,
        )

        action = "PROGRAMME_EDITED"
        if payload.department_id and str(payload.department_id) != old_dept_id:
            action = "PROGRAMME_DEPARTMENT_CHANGED"

        await audit_repo.create(
            action=action,
            resource="Programme",
            user_id=current_admin.id,
            details={
                "programme_id": str(updated.id),
                "old_name": old_prog.name,
                "new_name": updated.name,
                "old_code": old_prog.code,
                "new_code": updated.code,
            },
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise e

    count_students = await repo.get_enrolled_students_count(updated.id)
    return ProgrammeResponse(
        id=updated.id,
        institution_id=updated.institution_id,
        department_id=updated.department_id,
        name=updated.name,
        programme_name=updated.name,
        code=updated.code,
        programme_code=updated.code,
        degree_type=updated.degree_type,
        duration_years=updated.duration_years,
        total_semesters=updated.total_semesters,
        regulation_name=updated.regulation_name,
        description=updated.description,
        is_active=updated.is_active,
        created_by=updated.created_by,
        institution_name=updated.institution.name if updated.institution else None,
        department_name=updated.department.name if updated.department else None,
        enrolled_students_count=count_students,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.post("/{programme_id}/activate", response_model=ProgrammeResponse)
async def activate_programme(
    programme_id: uuid.UUID,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    audit_repo = AuditRepository(db)

    prog = await repo.set_programme_status(programme_id, is_active=True)
    await audit_repo.create(
        action="PROGRAMME_ACTIVATED",
        resource="Programme",
        user_id=current_admin.id,
        details={"programme_id": str(programme_id), "programme_code": prog.code},
    )
    await db.commit()

    count_students = await repo.get_enrolled_students_count(prog.id)
    return ProgrammeResponse(
        id=prog.id,
        institution_id=prog.institution_id,
        department_id=prog.department_id,
        name=prog.name,
        programme_name=prog.name,
        code=prog.code,
        programme_code=prog.code,
        degree_type=prog.degree_type,
        duration_years=prog.duration_years,
        total_semesters=prog.total_semesters,
        regulation_name=prog.regulation_name,
        description=prog.description,
        is_active=prog.is_active,
        created_by=prog.created_by,
        institution_name=prog.institution.name if prog.institution else None,
        department_name=prog.department.name if prog.department else None,
        enrolled_students_count=count_students,
        created_at=prog.created_at,
        updated_at=prog.updated_at,
    )


@router.post("/{programme_id}/deactivate", response_model=ProgrammeResponse)
async def deactivate_programme(
    programme_id: uuid.UUID,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    audit_repo = AuditRepository(db)

    prog = await repo.set_programme_status(programme_id, is_active=False)
    await audit_repo.create(
        action="PROGRAMME_DEACTIVATED",
        resource="Programme",
        user_id=current_admin.id,
        details={"programme_id": str(programme_id), "programme_code": prog.code},
    )
    await db.commit()

    count_students = await repo.get_enrolled_students_count(prog.id)
    return ProgrammeResponse(
        id=prog.id,
        institution_id=prog.institution_id,
        department_id=prog.department_id,
        name=prog.name,
        programme_name=prog.name,
        code=prog.code,
        programme_code=prog.code,
        degree_type=prog.degree_type,
        duration_years=prog.duration_years,
        total_semesters=prog.total_semesters,
        regulation_name=prog.regulation_name,
        description=prog.description,
        is_active=prog.is_active,
        created_by=prog.created_by,
        institution_name=prog.institution.name if prog.institution else None,
        department_name=prog.department.name if prog.department else None,
        enrolled_students_count=count_students,
        created_at=prog.created_at,
        updated_at=prog.updated_at,
    )


@router.get("/{programme_id}/students", response_model=list[ProgrammeStudentResponse])
async def list_programme_students(
    programme_id: uuid.UUID,
    current_admin: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db),
):
    repo = AcademicsRepository(db)
    students = await repo.list_programme_students(programme_id)
    return [
        ProgrammeStudentResponse(
            id=s["id"],
            student_id_number=s["student_id_number"],
            full_name=s["full_name"],
            email=s["email"],
        )
        for s in students
    ]
