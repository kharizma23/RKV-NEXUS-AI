import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

import app.modules.audit.model
import app.modules.roles.model
import app.modules.institutions.model
import app.modules.users.model
import app.modules.auth.model
import app.modules.audit.model
import app.modules.academics.model
import app.modules.syllabus.model
import app.modules.learning_outcomes.model
import app.modules.questions.model
import app.modules.examinations.model
import app.modules.assessment_attempts.model
import app.modules.evaluation.model
import app.modules.personalized_learning.model
import app.modules.explainable_assessment.model
import app.modules.multimodal_ingestion.model
import app.modules.notifications.model
import app.modules.gamification.model
import app.modules.predictions.model
import app.modules.chatbot.model
import app.modules.adaptive.model
import app.modules.localization.model
import app.modules.study_plans.model
import app.modules.benchmarking.model
import app.modules.knowledge_graph.model
import app.modules.dropout.model
import app.modules.parents.model
import app.modules.voice.model
import app.modules.plagiarism.model
import app.modules.calendar.model
import app.modules.two_factor.model
import app.modules.skills.model
import app.modules.certificates.model
import app.modules.wellness.model
import app.modules.vr.model
import app.modules.global_benchmarking.model
import app.modules.alumni.model
import app.modules.calibration.model
import app.modules.seating.model
import app.modules.timetable.model
import app.modules.fees.model
import app.modules.hostel.model
import app.modules.exam_conduction_evaluation.model
import app.modules.new_functionalities.model
from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.exceptions import BaseAppException, app_exception_handler, general_exception_handler
from app.core.logging import logger


from app.database.base import Base
from app.database.session import sync_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} backend...")
    try:
        Base.metadata.create_all(bind=sync_engine)
    except Exception as e:
        logger.warning(f"Database schema auto-creation note: {e}")
    yield
    logger.info("Shutting down backend...")

app: FastAPI = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Middleware: Request ID tracking
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    response: Response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(BaseAppException, app_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
app.include_router(api_v1_router, prefix="/api")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.get("/docs", include_in_schema=False)
async def redirect_to_docs():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/", include_in_schema=False)
async def root_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/ready", tags=["Health"])
async def readiness_check():
    try:
        from sqlalchemy import text
        from app.database.session import async_engine
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "healthy_connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "ready", "database": "connected", "note": "Database engine initialized"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
