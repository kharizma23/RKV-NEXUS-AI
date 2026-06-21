import json
from typing import List, Union, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Integrated AI Assessment Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "dev_secret_key_change_in_production_min_32_chars_long"
    CSRF_SECRET: str = "dev_csrf_secret_change_in_production_min_32_chars_long"

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "assessment_user"
    POSTGRES_PASSWORD: str = "assessment_password"
    POSTGRES_DB: str = "assessment_db"
    DATABASE_URL: str = "postgresql+asyncpg://assessment_user:assessment_password@localhost:5432/assessment_db"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://assessment_user:assessment_password@localhost:5432/assessment_db"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "assessment-files"
    MINIO_SECURE: bool = False

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for stable development session
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    COOKIE_DOMAIN: str = "localhost"

    SEED_ADMIN_EMAIL: str = "Admin23@gmail.com"
    SEED_ADMIN_PASSWORD: str = "ADMIN123"
    SEED_FACULTY_APPROVED_EMAIL: str = "faculty@platform.edu"
    SEED_FACULTY_PENDING_EMAIL: str = "faculty.pending@platform.edu"
    SEED_FACULTY_PASSWORD: str = "Faculty123"
    SEED_STUDENT_EMAIL: str = "student@platform.edu"
    SEED_STUDENT_PASSWORD: str = "Student123"

    AI_PROVIDER: str = "openai"
    AI_API_KEY: str | None = None
    MODEL_NAME: str | None = "gemini-flash-lite-latest"
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str | None = "gemini-flash-lite-latest"
    AI_TIMEOUT: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()
