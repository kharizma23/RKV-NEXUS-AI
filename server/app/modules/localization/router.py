import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.localization.service import LocalizationService

router = APIRouter(tags=["Multi-Language Support & Localization"])

class UpdateLanguageRequest(BaseModel):
    language: str

@router.get("/translations/{lang}")
async def get_translations(
    lang: str,
    db: AsyncSession = Depends(get_db)
):
    service = LocalizationService(db)
    translations = await service.get_translations_for_lang(lang)
    return {
        "status": "success",
        "lang": lang,
        "translations": translations
    }

@router.put("/user/language")
async def update_user_language_endpoint(
    payload: UpdateLanguageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = LocalizationService(db)
    updated_lang = await service.update_user_language(current_user.id, payload.language)
    return {
        "status": "success",
        "message": f"Language preference set to '{updated_lang}'.",
        "language": updated_lang
    }
