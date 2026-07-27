import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.examinations.repository import ExaminationRepository
from app.modules.examinations.service import ExaminationService
from app.modules.examinations.schema import (
    AssessmentBlueprintResponse, AssessmentBlueprintCreate,
    ExaminationResponse, ExaminationCreate, AddExamQuestionRequest
)
from app.modules.users.model import User

router = APIRouter(prefix="/examinations", tags=["Examination Engine"])

@router.get("/blueprints/{subject_id}", response_model=list[AssessmentBlueprintResponse])
async def list_blueprints(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ExaminationRepository(db)
    return await repo.list_blueprints(subject_id)

@router.post("/blueprints", response_model=AssessmentBlueprintResponse, status_code=status.HTTP_201_CREATED)
async def create_blueprint(
    payload: AssessmentBlueprintCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = ExaminationRepository(db)
    bp = await repo.create_blueprint(payload)
    await db.commit()
    return bp

@router.get("/published", response_model=list[ExaminationResponse])
async def list_published_exams(
    subject_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    repo = ExaminationRepository(db)
    return await repo.list_published_examinations(subject_id)

@router.get("/{exam_id}", response_model=ExaminationResponse)
async def get_examination(exam_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ExaminationRepository(db)
    exam = await repo.get_examination_by_id(exam_id)
    if not exam:
        raise ValueError("Examination not found")
    return exam

@router.post("/create", response_model=ExaminationResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=ExaminationResponse, status_code=status.HTTP_201_CREATED)
async def create_examination(
    payload: ExaminationCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    # Enforce 2026 Academic Anchor Matrix cohort verification
    from app.core.academic_matrix import validate_cohort_alignment
    validate_cohort_alignment(payload.target_batch, payload.target_semester)

    repo = ExaminationRepository(db)
    service = ExaminationService(db)
    faculty_id = current_user.faculty_profile.id if current_user.faculty_profile else None
    exam = await repo.create_examination(payload, faculty_id=faculty_id)
    if payload.blueprint_id:
        await service.generate_paper_from_blueprint(exam.id, payload.subject_id)
    await db.commit()
    ret = await repo.get_examination_by_id(exam.id)
    assert ret is not None
    return ret

@router.get("/assigned", response_model=list[ExaminationResponse])
async def get_assigned_examinations(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select, and_, or_
    from app.modules.examinations.model import Examination

    # Retrieve student's verified profile claims
    stmt = (
        select(User)
        .options(selectinload(User.student_profile))
        .where(User.id == current_user.id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    student = user.student_profile if user else None

    if not student:
        return []

    # Database query filtering by student's active cohort parameters
    conditions = [Examination.is_published == True]

    if student.target_batch:
        conditions.append(
            or_(Examination.target_batch == None, Examination.target_batch == student.target_batch)
        )
    else:
        conditions.append(Examination.target_batch == None)

    if student.target_semester is not None:
        conditions.append(
            or_(Examination.target_semester == None, Examination.target_semester == student.target_semester)
        )
    else:
        conditions.append(Examination.target_semester == None)

    if student.department_id:
        conditions.append(
            or_(Examination.target_department_id == None, Examination.target_department_id == student.department_id)
        )
    else:
        conditions.append(Examination.target_department_id == None)

    exam_stmt = (
        select(Examination)
        .options(selectinload(Examination.exam_questions))
        .where(and_(*conditions))
        .order_by(Examination.start_time.asc())
    )
    exam_res = await db.execute(exam_stmt)
    return list(exam_res.scalars().all())

@router.post("/{exam_id}/questions", response_model=ExaminationResponse)
async def add_question_to_exam(
    exam_id: uuid.UUID,
    payload: AddExamQuestionRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = ExaminationRepository(db)
    await repo.add_question_to_exam(
        exam_id=exam_id,
        question_id=payload.question_id,
        marks=payload.marks_allocated,
        order_index=payload.order_index
    )
    await db.commit()
    exam = await repo.get_examination_by_id(exam_id)
    assert exam is not None
    return exam
