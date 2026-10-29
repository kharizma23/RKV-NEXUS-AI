import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.chatbot.service import ChatbotService, SUGGESTED_QUESTIONS

router = APIRouter(prefix="/chat", tags=["Student AI Chatbot"])

class SendMessageRequest(BaseModel):
    content: str
    session_id: Optional[uuid.UUID] = None
    language: Optional[str] = "en"

class SessionEndRequest(BaseModel):
    session_id: uuid.UUID

@router.post("/message")
async def send_chat_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    service = ChatbotService(db)
    result = await service.process_student_message(
        user_id=current_user.id,
        content=payload.content.strip(),
        session_id=payload.session_id,
        language=payload.language
    )
    return {"status": "success", "data": result}

@router.get("/history")
async def get_chat_history(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatbotService(db)
    history = await service.get_session_history(user_id=current_user.id, limit=limit)
    return {
        "status": "success",
        "data": {
            "messages": history,
            "suggested_questions": SUGGESTED_QUESTIONS
        }
    }

@router.post("/session/start")
async def start_chat_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatbotService(db)
    session = await service.get_or_create_session(current_user.id)
    return {
        "status": "success",
        "session_id": str(session.id),
        "started_at": session.started_at.isoformat(),
        "suggested_questions": SUGGESTED_QUESTIONS
    }

@router.post("/session/end")
async def end_chat_session(
    payload: SessionEndRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatbotService(db)
    success = await service.end_session(payload.session_id)
    return {"status": "success", "ended": success}
