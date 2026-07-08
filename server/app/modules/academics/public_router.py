import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Programme, AcademicYear, Semester
from app.modules.institutions.schema import InstitutionResponse, DepartmentResponse
from app.modules.academics.schema import ProgrammeResponse, AcademicYearResponse, SemesterResponse

router = APIRouter(prefix="/public", tags=["Public Registration Metadata"])

@router.get("/institutions", response_model=list[InstitutionResponse])
async def get_public_institutions(db: AsyncSession = Depends(get_db)):
    stmt = select(Institution).options(selectinload(Institution.departments)).where(Institution.is_active == True)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/institutions/{institution_id}/departments", response_model=list[DepartmentResponse])
async def get_public_departments(institution_id: str, db: AsyncSession = Depends(get_db)):
    try:
        inst_uuid = uuid.UUID(institution_id)
        stmt = select(Department).where(Department.institution_id == inst_uuid)
    except ValueError:
        # Match by institution code (e.g., AIT, BIT, IITM)
        inst_stmt = select(Institution).where(Institution.code.ilike(institution_id))
        inst_res = await db.execute(inst_stmt)
        inst = inst_res.scalar_one_or_none()
        if not inst:
            return []
        stmt = select(Department).where(Department.institution_id == inst.id)

    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/departments/{department_id}/programmes", response_model=list[ProgrammeResponse])
async def get_public_programmes_by_dept(department_id: str, db: AsyncSession = Depends(get_db)):
    try:
        dept_uuid = uuid.UUID(department_id)
        stmt = select(Programme).where(Programme.department_id == dept_uuid, Programme.is_active == True).order_by(Programme.name)
        res = await db.execute(stmt)
        progs = list(res.scalars().all())
        if progs:
            return progs
    except ValueError:
        pass

    # Fallback search by department code or name
    dept_stmt = select(Department).where((Department.code.ilike(department_id)) | (Department.name.ilike(f"%{department_id}%")))
    dept_res = await db.execute(dept_stmt)
    depts = list(dept_res.scalars().all())
    if depts:
        dept_ids = [d.id for d in depts]
        stmt = select(Programme).where(Programme.department_id.in_(dept_ids), Programme.is_active == True).order_by(Programme.name)
        res = await db.execute(stmt)
        progs = list(res.scalars().all())
        if progs:
            return progs

    # Ultimate fallback: return all active programmes
    fallback_stmt = select(Programme).where(Programme.is_active == True).order_by(Programme.name).limit(20)
    res = await db.execute(fallback_stmt)
    return list(res.scalars().all())

@router.get("/institutions/{institution_id}/departments/{department_id}/programmes", response_model=list[ProgrammeResponse])
async def get_public_programmes(institution_id: str, department_id: str, db: AsyncSession = Depends(get_db)):
    return await get_public_programmes_by_dept(department_id, db)

@router.get("/programmes/{programme_id}/academic-years", response_model=list[AcademicYearResponse])
async def get_public_academic_years(programme_id: str, db: AsyncSession = Depends(get_db)):
    try:
        prog_uuid = uuid.UUID(programme_id)
        prog_stmt = select(Programme).where(Programme.id == prog_uuid)
        prog_res = await db.execute(prog_stmt)
        prog = prog_res.scalar_one_or_none()
        if prog:
            stmt = select(AcademicYear).where(AcademicYear.institution_id == prog.institution_id).order_by(AcademicYear.year_label.desc())
            res = await db.execute(stmt)
            ay_list = list(res.scalars().all())
            if ay_list:
                return ay_list
    except ValueError:
        pass

    # Fallback to all active academic years
    stmt = select(AcademicYear).order_by(AcademicYear.year_label.desc()).limit(10)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/programmes/{programme_id}/semesters", response_model=list[SemesterResponse])
async def get_public_semesters(programme_id: str, db: AsyncSession = Depends(get_db)):
    try:
        prog_uuid = uuid.UUID(programme_id)
        prog_stmt = select(Programme).where(Programme.id == prog_uuid)
        prog_res = await db.execute(prog_stmt)
        prog = prog_res.scalar_one_or_none()
        if prog:
            ay_stmt = select(AcademicYear).where(AcademicYear.institution_id == prog.institution_id, AcademicYear.is_current == True)
            ay_res = await db.execute(ay_stmt)
            ay = ay_res.scalar_one_or_none()
            if not ay:
                ay_stmt = select(AcademicYear).where(AcademicYear.institution_id == prog.institution_id)
                ay_res = await db.execute(ay_stmt)
                ay = ay_res.scalars().first()
            if ay:
                stmt = select(Semester).where(Semester.academic_year_id == ay.id, Semester.is_active == True).order_by(Semester.semester_number)
                res = await db.execute(stmt)
                sem_list = list(res.scalars().all())
                if sem_list:
                    return sem_list
    except ValueError:
        pass

    # Fallback to all active semesters
    stmt = select(Semester).where(Semester.is_active == True).order_by(Semester.semester_number).limit(10)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/next-emp-id")
async def get_next_emp_id(db: AsyncSession = Depends(get_db)):
    from app.modules.users.model import FacultyProfile
    from sqlalchemy import func
    stmt = select(func.count(FacultyProfile.id))
    res = await db.execute(stmt)
    count = res.scalar() or 0
    next_num = 1001 + count
    return {"next_emp_id": f"EMP-{next_num}"}


