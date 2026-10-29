import uuid
from datetime import datetime, UTC
from typing import Dict, Any, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.localization.model import Translation
from app.modules.users.model import User, StudentProfile

# Comprehensive UI & Academic Translations
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "app_title": "RKV NEXUS AI Smart Examination Platform",
        "welcome": "Welcome back",
        "dashboard": "Dashboard",
        "examinations": "Examinations",
        "results": "Results & Scorecard",
        "learning_plan": "AI Learning Plan",
        "leaderboard": "Leaderboard",
        "badges": "Achievements & Badges",
        "points": "Reward Points",
        "streak": "Daily Streak",
        "start_exam": "Start Examination",
        "submit_exam": "Submit Examination",
        "time_remaining": "Time Remaining",
        "ai_recommendations": "AI Personalized Recommendations",
        "co_attainment": "Course Outcome Attainment",
        "performance_prediction": "Performance Forecast",
        "predicted_grade": "Predicted Grade",
        "risk_level": "Academic Risk Level",
        "chat_support": "24/7 AI Academic Tutor",
        "language_saved": "Language preference updated successfully.",
        "difficulty": "Difficulty",
        "ability_score": "Cognitive Ability Score"
    },
    "ta": {
        "app_title": "RKV நெக்ஸஸ் AI ஸ்மார்ட் தேர்வு தளம்",
        "welcome": "நல்வரவு",
        "dashboard": "முகப்பு பலகை",
        "examinations": "தேர்வுகள்",
        "results": "முடிவுகள் & மதிப்பெண் அட்டை",
        "learning_plan": "AI கற்றல் திட்டம்",
        "leaderboard": "முன்னணி பட்டியல்",
        "badges": "சாதனை பேட்ஜ்கள்",
        "points": "வெகுமதி புள்ளிகள்",
        "streak": "தொடர் நாட்கள்",
        "start_exam": "தேர்வைத் தொடங்கு",
        "submit_exam": "தேர்வை சமர்ப்பி",
        "time_remaining": "மீதமுள்ள நேரம்",
        "ai_recommendations": "AI தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்",
        "co_attainment": "பாட விளைவு அடைவு (CO)",
        "performance_prediction": "செயல்திறன் முன்கணிப்பு",
        "predicted_grade": "கணிக்கப்பட்ட தரம்",
        "risk_level": "கல்வி அபாய நிலை",
        "chat_support": "24/7 AI கல்வி வழிகாட்டி",
        "language_saved": "மொழி விருப்பம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",
        "difficulty": "கடினத்தன்மை",
        "ability_score": "அறிவாற்றல் திறன் மதிப்பெண்"
    },
    "hi": {
        "app_title": "RKV नेक्सस AI स्मार्ट परीक्षा मंच",
        "welcome": "वापसी पर स्वागत है",
        "dashboard": "डैशबोर्ड",
        "examinations": "परीक्षाएं",
        "results": "परिणाम और स्कोरकार्ड",
        "learning_plan": "AI शिक्षण योजना",
        "leaderboard": "लीडरबोर्ड",
        "badges": "उपलब्धि बैज",
        "points": "रिवार्ड पॉइंट्स",
        "streak": "दैनिक स्ट्रीक",
        "start_exam": "परीक्षा शुरू करें",
        "submit_exam": "परीक्षा जमा करें",
        "time_remaining": "शेष समय",
        "ai_recommendations": "AI व्यक्तिगत सिफारिशें",
        "co_attainment": "पाठ्यक्रम परिणाम प्राप्ति (CO)",
        "performance_prediction": "प्रदर्शन पूर्वानुमान",
        "predicted_grade": "अनुमानित ग्रेड",
        "risk_level": "शैक्षणिक जोखिम स्तर",
        "chat_support": "24/7 AI शैक्षणिक ट्यूटर",
        "language_saved": "भाषा प्राथमिकता सफलतापूर्वक अपडेट की गई।",
        "difficulty": "कठिनाई स्तर",
        "ability_score": "संज्ञानात्मक क्षमता स्कोर"
    }
}

class LocalizationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_translations_for_lang(self, lang_code: str) -> Dict[str, str]:
        code = lang_code.lower().strip()
        if code not in TRANSLATIONS:
            code = "en"
        return TRANSLATIONS[code]

    async def update_user_language(self, user_id: uuid.UUID, lang_code: str) -> str:
        code = lang_code.lower().strip()
        if code not in ["en", "ta", "hi"]:
            code = "en"

        # Update StudentProfile if student
        stmt = select(StudentProfile).where(StudentProfile.user_id == user_id)
        res = await self.db.execute(stmt)
        sp = res.scalar_one_or_none()
        if sp:
            sp.preferred_language = code
            await self.db.flush()

        return code
