# Architecture Overview

## Modular Monolith Design
The **Integrated AI Platform for Academic Assessment, Evaluation and Personalized Learning** is built as a production-grade Modular Monolith.

```
┌─────────────────────────────────────────────────────────┐
│                Next.js TypeScript Frontend               │
│                                                         │
│ Public │ Authentication │ Student │ Faculty │ Admin     │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (/api/v1)
                           │ HttpOnly Cookies
┌──────────────────────────▼──────────────────────────────┐
│                   FastAPI Backend                       │
│                                                         │
│ Auth │ Users │ Roles │ Institutions │ Audit │ (Future)  │
└─────────────┬─────────────┬──────────────┬─────────────┘
              │             │              │
      ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────────┐
      │ PostgreSQL   │ │ Redis    │ │ MinIO / S3     │
      │ + pgvector   │ │ Celery   │ │ File Storage   │
      └──────────────┘ └──────────┘ └────────────────┘
```

## Modular Backend Structure
Every domain module under `server/app/modules/<module_name>` follows the standard structure:
- `model.py`: SQLAlchemy table definitions & relationships
- `schema.py`: Pydantic request/response schemas
- `repository.py`: Database queries & persistence layer
- `service.py`: Domain business logic & audit logging
- `router.py`: FastAPI route handlers & dependency injections
- `permissions.py`: Module authorization dependencies
- `exceptions.py`: Module domain errors
- `tests/`: Module unit/integration tests
