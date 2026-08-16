import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.chatbot.service import AITutorService, SUGGESTED_PROMPTS

router = APIRouter(prefix="/student/ai-tutor", tags=["Student AI Academic Tutor"])

class StartSessionRequest(BaseModel):
    topic: Optional[str] = None

class SendMessageRequest(BaseModel):
    content: Optional[str] = None
    message: Optional[str] = None
    session_id: Optional[uuid.UUID] = None
    language: Optional[str] = "en"

class EscalateRequest(BaseModel):
    question: str

@router.post("/session/start")
async def start_ai_tutor_session(
    payload: Optional[StartSessionRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AITutorService(db)
    topic = payload.topic if payload else None
    session = await service.get_or_create_session(current_user.id, topic=topic)
    ctx = await service.build_student_context(current_user.id)
    return {
        "status": "success",
        "data": {
            "session_id": str(session.id),
            "started_at": session.started_at.isoformat(),
            "topic": session.topic,
            "suggested_prompts": SUGGESTED_PROMPTS,
            "student_context": ctx
        }
    }

@router.post("/chat")
@router.post("/message")
async def send_ai_tutor_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    text = (payload.content or payload.message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    service = AITutorService(db)
    result = await service.process_student_message(
        user_id=current_user.id,
        content=text,
        session_id=payload.session_id,
        language=payload.language
    )
    result["response"] = result.get("reply", "")
    return {"status": "success", "data": result}

@router.get("/history")
async def get_ai_tutor_history(
    limit: int = 40,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AITutorService(db)
    history = await service.get_session_history(user_id=current_user.id, limit=limit)
    ctx = await service.build_student_context(current_user.id)
    return {
        "status": "success",
        "data": {
            "messages": history,
            "suggested_prompts": SUGGESTED_PROMPTS,
            "student_context": ctx
        }
    }

@router.post("/escalate")
async def escalate_question_to_faculty(
    payload: EscalateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    service = AITutorService(db)
    result = await service.escalate_question(
        user_id=current_user.id,
        question=payload.question.strip()
    )
    return {"status": "success", "data": result}

@router.get("/suggestions")
async def get_ai_tutor_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AITutorService(db)
    ctx = await service.build_student_context(current_user.id)
    return {
        "status": "success",
        "data": {
            "quick_prompts": SUGGESTED_PROMPTS,
            "weak_topics": ctx["weak_topics"],
            "upcoming_exams": ctx["upcoming_exams"],
            "growth_metrics": ctx["growth_metrics"]
        }
    }
