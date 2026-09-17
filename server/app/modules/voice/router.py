import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.voice.service import VoiceService

router = APIRouter(prefix="/voice", tags=["Voice-Based Answer Submission"])

class VoiceUploadRequest(BaseModel):
    audio_base64: str
    exam_id: Optional[uuid.UUID] = None
    question_id: Optional[uuid.UUID] = None
    language: Optional[str] = "en"

class TranscribeRequest(BaseModel):
    audio_base64: str
    language: Optional[str] = "en"

@router.post("/transcribe")
async def transcribe_audio(
    payload: TranscribeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VoiceService(db)
    result = await service.transcribe_audio_payload(
        audio_data=payload.audio_base64,
        language=payload.language or "en"
    )
    return {"status": "success", "data": result}

@router.post("/upload")
async def upload_voice_submission(
    payload: VoiceUploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VoiceService(db)
    transcription = await service.transcribe_audio_payload(
        audio_data=payload.audio_base64,
        language=payload.language or "en"
    )

    sub = await service.save_voice_submission(
        student_id=current_user.id,
        audio_url=f"/storage/voice/{uuid.uuid4()}.wav",
        transcribed_text=transcription["transcribed_text"],
        exam_id=payload.exam_id,
        question_id=payload.question_id,
        duration_seconds=transcription["duration_seconds"],
        language_code=transcription["language_detected"]
    )

    return {
        "status": "success",
        "message": "Voice answer uploaded and transcribed successfully.",
        "submission_id": str(sub.id),
        "transcribed_text": sub.transcribed_text,
        "confidence_score": sub.confidence_score
    }

@router.get("/submission/{submission_id}")
async def get_voice_submission(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = VoiceService(db)
    sub = await service.get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Voice submission not found.")
    return {
        "status": "success",
        "data": {
            "id": str(sub.id),
            "audio_url": sub.audio_url,
            "transcribed_text": sub.transcribed_text,
            "confidence_score": sub.confidence_score,
            "duration_seconds": sub.duration_seconds,
            "language_code": sub.language_code,
            "created_at": sub.created_at.isoformat()
        }
    }
