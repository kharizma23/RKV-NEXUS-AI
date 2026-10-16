import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.plagiarism.service import PlagiarismService

router = APIRouter(tags=["Advanced Plagiarism Detection"])

class PlagiarismCheckRequest(BaseModel):
    submission_id: uuid.UUID
    content_text: str

class PlagiarismActionRequest(BaseModel):
    action: str  # CONFIRMED_PLAGIARISM or CLEARED
    faculty_notes: Optional[str] = None

@router.post("/plagiarism/check")
async def run_plagiarism_check(
    payload: PlagiarismCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PlagiarismService(db)
    check = await service.run_plagiarism_check(payload.submission_id, payload.content_text)
    return {
        "status": "success",
        "check_id": str(check.id),
        "similarity_score": check.similarity_score,
        "is_flagged": check.similarity_score > 30.0
    }

@router.get("/plagiarism/report/{submission_id}")
async def get_plagiarism_report(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PlagiarismService(db)
    report = await service.get_plagiarism_report(submission_id)
    return {"status": "success", "data": report}

@router.get("/faculty/plagiarism/flagged")
async def get_faculty_flagged_submissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Query database for student answers with high cosine similarity
    query = text("""
        SELECT 
            id, student_a_name, student_a_roll, student_b_name, student_b_roll,
            exam_name, question_snippet, similarity_score, answer_a_text,
            answer_b_text, answer_a_image, answer_b_image, matching_phrases,
            status, created_at
        FROM flagged_plagiarism_pairs
        WHERE status = 'PENDING'
        ORDER BY similarity_score DESC
    """)
    res = await db.execute(query)
    rows = res.fetchall()

    results = []
    for r in rows:
        results.append({
            "id": str(r.id),
            "student_a": f"{r.student_a_name} ({r.student_a_roll})",
            "student_b": f"{r.student_b_name} ({r.student_b_roll})",
            "student_a_name": r.student_a_name,
            "student_a_roll": r.student_a_roll,
            "student_b_name": r.student_b_name,
            "student_b_roll": r.student_b_roll,
            "exam_name": r.exam_name,
            "question_snippet": r.question_snippet,
            "similarity_score": float(r.similarity_score),
            "answer_a_text": r.answer_a_text,
            "answer_b_text": r.answer_b_text,
            "answer_a_image": r.answer_a_image,
            "answer_b_image": r.answer_b_image,
            "matching_phrases": r.matching_phrases or [],
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return {
        "status": "success",
        "count": len(results),
        "data": results
    }

@router.post("/faculty/plagiarism/{record_id}/action")
async def action_plagiarism_record(
    record_id: uuid.UUID,
    payload: PlagiarismActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    valid_actions = ["CONFIRMED_PLAGIARISM", "CLEARED"]
    if payload.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Expected one of {valid_actions}"
        )

    stmt = text("""
        UPDATE flagged_plagiarism_pairs
        SET status = :act,
            updated_at = NOW()
        WHERE id = :rid
    """)
    await db.execute(stmt, {"act": payload.action, "rid": record_id})
    await db.commit()

    return {
        "status": "success",
        "message": f"Record updated to {payload.action}",
        "record_id": str(record_id),
        "new_status": payload.action
    }
