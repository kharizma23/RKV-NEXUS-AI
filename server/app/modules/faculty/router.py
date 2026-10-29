import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, UTC, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User, FacultyProfile
from app.modules.academics.model import Subject
from app.modules.examinations.model import Examination
from app.modules.questions.model import Question
from app.modules.evaluation.model import EvaluationResult

router = APIRouter(prefix="/faculty", tags=["Faculty Dashboard & Operations"])

@router.get("/dashboard")
async def get_faculty_dashboard(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    subjs_res = await db.execute(select(func.count(Subject.id)))
    assigned_count = subjs_res.scalar() or 0

    students_res = await db.execute(select(func.count(User.id)).where(User.roles.any(name="STUDENT")))
    total_students = students_res.scalar() or 0

    eval_res = await db.execute(select(func.count(EvaluationResult.id)).where(EvaluationResult.status != "PUBLISHED"))
    pending_evals = eval_res.scalar() or 0

    return {
        "status": "success",
        "data": {
            "facultyName": current_user.full_name,
            "assignedSubjects": assigned_count,
            "totalStudents": total_students,
            "pendingEvaluations": pending_evals,
            "avgPerformance": 84.5
        }
    }

@router.get("/subjects")
async def get_faculty_subjects(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Subject).limit(10))
    subjs = list(res.scalars().all())
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "code": s.code,
            "credits": getattr(s, "credits", 3),
            "subject_type": getattr(s, "subject_type", "THEORY")
        }
        for s in subjs
    ]

@router.get("/exams")
async def get_faculty_exams(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Examination).limit(10))
    exams = list(res.scalars().all())
    return [
        {
            "id": str(e.id),
            "title": e.title,
            "status": "PUBLISHED" if e.is_published else "DRAFT",
            "total_marks": e.total_marks,
            "duration_minutes": e.duration_minutes
        }
        for e in exams
    ]

@router.post("/exams")
async def create_faculty_exam(
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(UTC)
    # Get a valid subject_id or query first subject
    subject_id = payload.get("subject_id")
    if not subject_id:
        subj_res = await db.execute(select(Subject.id).limit(1))
        subject_id = subj_res.scalar()
    else:
        subject_id = uuid.UUID(subject_id)

    if not subject_id:
        subject_id = uuid.uuid4()

    exam = Examination(
        subject_id=subject_id,
        title=payload.get("title", "New Examination"),
        exam_type=payload.get("exam_type", "MID_TERM"),
        total_marks=payload.get("total_marks", 100.0),
        duration_minutes=payload.get("duration_minutes", 60),
        start_time=now,
        end_time=now + timedelta(hours=2),
        is_published=False
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return {"status": "success", "id": str(exam.id), "title": exam.title}

@router.put("/exams/{exam_id}")
async def update_faculty_exam(
    exam_id: uuid.UUID,
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Examination).where(Examination.id == exam_id))
    exam = res.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if "title" in payload: exam.title = payload["title"]
    if "is_published" in payload: exam.is_published = payload["is_published"]
    await db.commit()
    return {"status": "success", "message": "Exam updated successfully"}

@router.delete("/exams/{exam_id}")
async def delete_faculty_exam(
    exam_id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Examination).where(Examination.id == exam_id))
    exam = res.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    await db.delete(exam)
    await db.commit()
    return {"status": "success", "message": "Exam deleted successfully"}

@router.get("/questions")
async def get_faculty_questions(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Question).limit(20))
    q_items = list(res.scalars().all())
    return [
        {
            "id": str(q.id),
            "question_text": q.prompt,
            "question_type": q.question_type,
            "marks": q.default_marks,
            "difficulty": q.difficulty,
            "bloom_level": q.bloom_level
        }
        for q in q_items
    ]

@router.post("/questions")
async def create_faculty_question(
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    subject_id = payload.get("subject_id")
    if not subject_id:
        subj_res = await db.execute(select(Subject.id).limit(1))
        subject_id = subj_res.scalar() or uuid.uuid4()
    else:
        subject_id = uuid.UUID(subject_id)

    q = Question(
        subject_id=subject_id,
        prompt=payload.get("question_text", "Sample Question Prompt"),
        question_type=payload.get("question_type", "MCQ"),
        default_marks=payload.get("marks", 2.0),
        difficulty=payload.get("difficulty", "MEDIUM"),
        bloom_level=payload.get("bloom_level", "APPLY")
    )
    db.add(q)
    await db.commit()
    await db.refresh(q)
    return {"status": "success", "id": str(q.id)}

@router.put("/questions/{question_id}")
async def update_faculty_question(
    question_id: uuid.UUID,
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Question).where(Question.id == question_id))
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    if "question_text" in payload: q.prompt = payload["question_text"]
    if "marks" in payload: q.default_marks = payload["marks"]
    await db.commit()
    return {"status": "success", "message": "Question updated successfully"}

@router.get("/evaluations")
async def get_faculty_evaluations(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EvaluationResult).limit(10))
    evals = list(res.scalars().all())
    return [
        {
            "id": str(e.id),
            "status": e.status,
            "score": e.total_score,
            "max_score": e.max_score,
            "percentage": e.percentage,
            "grade": e.grade
        }
        for e in evals
    ]

@router.put("/evaluations/{evaluation_id}")
async def update_faculty_evaluation(
    evaluation_id: uuid.UUID,
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EvaluationResult).where(EvaluationResult.id == evaluation_id))
    ev = res.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    if "score" in payload: ev.total_score = payload["score"]
    if "status" in payload: ev.status = payload["status"]
    await db.commit()
    return {"status": "success", "message": "Evaluation updated successfully"}

@router.get("/co-tracking")
async def get_faculty_co_tracking(
    current_user: User = Depends(require_roles(["FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    return {
        "status": "success",
        "data": [
            {"co_number": 1, "attainment": 84.5, "status": "ACHIEVED"},
            {"co_number": 2, "attainment": 78.0, "status": "ACHIEVED"},
            {"co_number": 3, "attainment": 89.2, "status": "EXCEEDED"},
            {"co_number": 4, "attainment": 72.1, "status": "NEEDS_IMPROVEMENT"}
        ]
    }
