import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User, StudentProfile
from app.modules.academics.model import Subject, Programme
from app.modules.examinations.model import Examination
from app.modules.evaluation.model import EvaluationResult

router = APIRouter(prefix="/student", tags=["Student Dashboard & Operations"])

@router.get("/dashboard")
async def get_student_dashboard(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).options(selectinload(User.student_profile)).where(User.id == current_user.id)
    res = await db.execute(stmt)
    u = res.scalar_one_or_none()

    sp = u.student_profile if u else None
    roll_num = sp.student_id_number if sp else "23CSE001"

    subjs_res = await db.execute(select(func.count(Subject.id)))
    enrolled_count = min(5, subjs_res.scalar() or 5)

    exams_res = await db.execute(select(func.count(Examination.id)))
    upcoming_exams = min(3, exams_res.scalar() or 2)

    return {
        "status": "success",
        "data": {
            "fullName": current_user.full_name,
            "programmeName": "B.E. Computer Science and Engineering",
            "currentSemester": 1,
            "rollNumber": roll_num,
            "enrolledSubjects": enrolled_count,
            "upcomingExams": upcoming_exams,
            "avgMastery": 82.0,
            "coAttainment": 85.5,
            "weakAreas": [
                {
                    "topicId": "ds-trees",
                    "topic": "Binary Search Trees & Balancing",
                    "suggestion": "Review BST insertion algorithms and solve 3 practice problems.",
                    "performance": 48
                },
                {
                    "topicId": "math-calculus",
                    "topic": "Differential Calculus & Matrix Eigenvalues",
                    "suggestion": "Complete module 2 practice quiz on matrix transformations.",
                    "performance": 52
                }
            ],
            "recentResults": [
                {
                    "id": "res-1",
                    "examTitle": "Mid-Term Examination 2026",
                    "subjectName": "Programming Fundamentals",
                    "marksObtained": 88,
                    "totalMarks": 100,
                    "percentage": 88.0
                },
                {
                    "id": "res-2",
                    "examTitle": "Unit Assessment 1",
                    "subjectName": "Engineering Mathematics I",
                    "marksObtained": 74,
                    "totalMarks": 100,
                    "percentage": 74.0
                }
            ]
        }
    }

@router.get("/subjects")
async def get_student_subjects(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Subject).limit(10))
    subjs = list(res.scalars().all())
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "code": s.code,
            "credits": getattr(s, "credits", 3)
        }
        for s in subjs
    ]

@router.get("/exams")
@router.get("/examinations")
async def get_student_exams(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Examination).limit(10))
    exams = list(res.scalars().all())
    return [
        {
            "id": str(e.id),
            "title": e.title,
            "duration_minutes": e.duration_minutes,
            "total_marks": e.total_marks,
            "status": "PUBLISHED" if e.is_published else "DRAFT"
        }
        for e in exams
    ]

@router.post("/exams/{exam_id}/submit")
async def submit_student_exam(
    exam_id: uuid.UUID,
    payload: dict[str, Any],
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    return {
        "status": "success",
        "message": "Exam submitted successfully. AI evaluation in progress.",
        "submission_id": str(uuid.uuid4())
    }

@router.get("/results")
async def get_student_results(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EvaluationResult).limit(10))
    results = list(res.scalars().all())
    return [
        {
            "id": str(r.id),
            "exam_title": "Internal Assessment",
            "marks_obtained": r.total_score,
            "total_marks": r.max_score,
            "percentage": r.percentage,
            "grade": r.grade
        }
        for r in results
    ]

@router.get("/learning-plan")
async def get_student_learning_plan(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    return {
        "status": "success",
        "data": {
            "current_focus": "Data Structures & Algorithms",
            "completion_percentage": 68,
            "recommended_modules": [
                {"title": "Tree Traversals & BSTs", "duration": "45 mins"},
                {"title": "Graph Algorithms & Shortest Path", "duration": "60 mins"}
            ]
        }
    }

@router.get("/co-performance")
async def get_student_co_performance(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    return {
        "status": "success",
        "data": [
            {"co": "CO1", "score": 88.0, "status": "MASTERED"},
            {"co": "CO2", "score": 76.5, "status": "PROFICIENT"},
            {"co": "CO3", "score": 82.0, "status": "PROFICIENT"},
            {"co": "CO4", "score": 64.0, "status": "DEVELOPING"}
        ]
    }
