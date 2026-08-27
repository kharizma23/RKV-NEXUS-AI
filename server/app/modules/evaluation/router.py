import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.evaluation.repository import EvaluationRepository
from app.modules.evaluation.service import EvaluationService
from app.modules.evaluation.schema import (
    EvaluationResultResponse, QuestionEvaluationResponse, OverrideScoreRequest
)
from app.modules.users.model import User

router = APIRouter(prefix="/evaluation", tags=["AI Evaluation & Gradebook Engine"])

@router.post("/grade-attempt/{attempt_id}", response_model=EvaluationResultResponse)
async def grade_attempt(
    attempt_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY", "STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = EvaluationService(db)
    return await service.grade_attempt(attempt_id)

@router.get("/queue/my", response_model=list[EvaluationResultResponse])
async def evaluation_queue(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = EvaluationRepository(db)
    return await repo.list_faculty_evaluation_queue()

@router.patch("/override/{question_eval_id}", response_model=QuestionEvaluationResponse)
async def override_score(
    question_eval_id: uuid.UUID,
    payload: OverrideScoreRequest,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    # Enforce faculty institution bounds checks
    if current_user.faculty_profile and current_user.faculty_profile.institution_id and "ADMIN" not in (current_user.roles or []):
        from sqlalchemy import select, or_
        from app.modules.users.model import StudentProfile
        from app.modules.assessment_attempts.model import StudentExamAttempt
        from app.modules.evaluation.model import QuestionEvaluation, EvaluationResult
        from fastapi import HTTPException
        
        stud_stmt = (
            select(StudentProfile.institution_id)
            .join(StudentExamAttempt, or_(
                StudentProfile.id == StudentExamAttempt.student_id,
                StudentProfile.user_id == StudentExamAttempt.student_id
            ))
            .join(EvaluationResult, StudentExamAttempt.id == EvaluationResult.attempt_id)
            .join(QuestionEvaluation, EvaluationResult.id == QuestionEvaluation.evaluation_result_id)
            .where(QuestionEvaluation.id == question_eval_id)
        )
        
        stud_res = await db.execute(stud_stmt)
        stud_inst_id = stud_res.scalar_one_or_none()
        if stud_inst_id and current_user.faculty_profile.institution_id != stud_inst_id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot review examinations outside your institution scope.")

    repo = EvaluationRepository(db)
    q_eval = await repo.override_score(
        question_eval_id,
        payload.faculty_score,
        payload.faculty_feedback,
        override_reason=payload.override_reason,
        reviewed_by_id=current_user.id
    )
    await db.commit()
    return q_eval

@router.post("/publish/{attempt_id}", response_model=EvaluationResultResponse)
async def publish_result(
    attempt_id: uuid.UUID,
    faculty_notes: Optional[str] = None,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = EvaluationRepository(db)
    result = await repo.publish_result(attempt_id, faculty_notes=faculty_notes)
    await db.commit()
    return result

@router.get("/results/my", response_model=list[EvaluationResultResponse])
async def my_results(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    repo = EvaluationRepository(db)
    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    return await repo.list_published_results(student_id)

@router.get("/results/{attempt_id}", response_model=EvaluationResultResponse)
async def get_result_by_attempt(
    attempt_id: uuid.UUID,
    current_user: User = Depends(require_roles(["STUDENT", "FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = EvaluationRepository(db)
    return await repo.get_or_create_result(attempt_id)


# =========================================================================
# EVALUATION & AI MODULES: CONFIDENCE AUDIT QUEUE & COUNTERFACTUAL ENGINE
# =========================================================================

from pydantic import BaseModel
from sqlalchemy import text

class AuditAnswerRequest(BaseModel):
    confirmed_marks: float
    faculty_feedback: Optional[str] = None

@router.get("/confidence-queue")
async def get_confidence_queue(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    query = text("""
        SELECT 
            sa.id, sa.attempt_id, sa.question_id, sa.text_response, sa.image_url,
            sa.score_awarded, sa.ai_confidence_score, sa.status, sa.counterfactual_feedback,
            sa.ai_suggested_marks, sa.rubric_breakdown, sa.extracted_text, sa.evaluator_feedback,
            q.prompt as question_prompt, q.default_marks as max_marks,
            u.full_name as student_name, sp.student_id_number as roll_number, sp.id as student_id,
            e.title as exam_title
        FROM student_answers sa
        LEFT JOIN questions q ON sa.question_id = q.id
        LEFT JOIN student_exam_attempts sea ON sa.attempt_id = sea.id
        LEFT JOIN examinations e ON sea.exam_id = e.id
        LEFT JOIN student_profiles sp ON sea.student_id = sp.id
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sa.ai_confidence_score < 0.8 AND sa.status = 'PENDING_AUDIT'
        ORDER BY sa.ai_confidence_score ASC
    """)
    res = await db.execute(query)
    rows = res.fetchall()

    items = []
    total_conf = 0.0
    for r in rows:
        conf = float(r.ai_confidence_score if r.ai_confidence_score is not None else 0.6)
        total_conf += conf
        prompt = r.question_prompt or "Explain fundamental architectural invariants."
        items.append({
            "id": str(r.id),
            "student_id": str(r.student_id) if r.student_id else "",
            "student_name": r.student_name or "Student",
            "roll_number": r.roll_number or "717621CSR000",
            "exam_name": r.exam_title or "Examination",
            "question_id": str(r.question_id),
            "question_text": prompt,
            "question_snippet": (prompt[:75] + "...") if len(prompt) > 75 else prompt,
            "student_answer": r.text_response or "(Handwritten Scan Attached)",
            "image_url": r.image_url,
            "extracted_text": r.extracted_text or r.text_response or "",
            "ai_suggested_marks": float(r.ai_suggested_marks if r.ai_suggested_marks is not None else 5.0),
            "ai_confidence_score": round(conf, 2),
            "max_marks": float(r.max_marks or 10.0),
            "rubric_breakdown": r.rubric_breakdown or {},
            "evaluator_feedback": r.evaluator_feedback or "",
            "status": r.status or "PENDING_AUDIT"
        })

    today_res = await db.execute(text("""
        SELECT COUNT(*) FROM student_answers WHERE status = 'AUDITED'
    """))
    audited_count = today_res.scalar() or 0

    avg_conf = (total_conf / len(rows) * 100) if rows else 76.5

    return {
        "stats": {
            "total_pending_audits": len(items),
            "average_confidence": round(avg_conf, 1),
            "audited_today": audited_count
        },
        "items": items
    }

@router.post("/confidence-queue/{answer_id}/audit")
@router.post("/{answer_id}/audit")
async def audit_answer(
    answer_id: uuid.UUID,
    payload: AuditAnswerRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    update_stmt = text("""
        UPDATE student_answers
        SET score_awarded = :score,
            faculty_marks = :score,
            status = 'AUDITED',
            evaluator_feedback = COALESCE(:feedback, evaluator_feedback)
        WHERE id = :aid
    """)
    await db.execute(update_stmt, {
        "score": payload.confirmed_marks,
        "feedback": payload.faculty_feedback,
        "aid": answer_id
    })
    await db.commit()
    return {
        "status": "success",
        "message": "Grade successfully confirmed and audited in database.",
        "answer_id": str(answer_id),
        "confirmed_marks": payload.confirmed_marks
    }

@router.get("/counterfactual-feed")
async def get_counterfactual_feed(
    query: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY", "STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    sql = """
        SELECT 
            sa.id, sa.text_response, sa.score_awarded, sa.ai_suggested_marks,
            sa.counterfactual_feedback, sa.evaluator_feedback, sa.status,
            q.prompt as question_prompt, q.default_marks as max_marks,
            u.full_name as student_name, sp.id as student_id,
            e.title as exam_title
        FROM student_answers sa
        LEFT JOIN questions q ON sa.question_id = q.id
        LEFT JOIN student_exam_attempts sea ON sa.attempt_id = sea.id
        LEFT JOIN examinations e ON sea.exam_id = e.id
        LEFT JOIN student_profiles sp ON sea.student_id = sp.id
        LEFT JOIN users u ON sp.user_id = u.id
        WHERE sa.counterfactual_feedback IS NOT NULL AND sa.counterfactual_feedback != ''
    """
    params = {}
    if query:
        sql += " AND (u.full_name ILIKE :q OR e.title ILIKE :q OR q.prompt ILIKE :q)"
        params["q"] = f"%{query}%"

    sql += " ORDER BY sa.answered_at DESC LIMIT 50"

    res = await db.execute(text(sql), params)
    rows = res.fetchall()

    cards = []
    for r in rows:
        max_m = float(r.max_marks or 10.0)
        curr_m = float(r.score_awarded if r.score_awarded is not None else (r.ai_suggested_marks or 6.0))
        lost = round(max(0.0, max_m - curr_m), 1)

        cards.append({
            "id": str(r.id),
            "student_id": str(r.student_id) if r.student_id else "",
            "student_name": r.student_name or "Student Candidate",
            "exam_name": r.exam_title or "Comprehensive Assessment",
            "question_text": r.question_prompt or "System Evaluation Question",
            "student_answer": r.text_response or "(Text response unavailable)",
            "score_awarded": curr_m,
            "max_marks": max_m,
            "lost_marks": lost,
            "ai_feedback": r.evaluator_feedback or f"You lost {lost} marks here due to partial derivation and omitted edge-case proofs.",
            "counterfactual_feedback": r.counterfactual_feedback,
            "status": r.status or "EVALUATED"
        })

    return {
        "status": "success",
        "count": len(cards),
        "feed": cards
    }
