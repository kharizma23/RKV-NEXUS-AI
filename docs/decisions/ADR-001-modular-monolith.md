# ADR-001: Modular Monolith Architecture

## Status
Accepted

## Context
The Integrated AI Platform for Academic Assessment, Evaluation and Personalized Learning encompasses 30 planned domain modules ranging from basic authentication to AI evaluation, handwritten OCR, voice viva, and plagiarism detection. 

Starting with a microservices architecture would introduce severe operational overhead, complex service-to-service authentication, distributed logging issues, network latency, multiple database migrations, and a cumbersome local setup for developers.

## Decision
We adopt a **Modular Monolith** architecture.
- **Frontend**: Single Next.js App Router TypeScript application organized by feature modules.
- **Backend**: Single Python FastAPI application structured by strict internal domain modules (`app/modules/<module_name>`).
- **Database**: Single PostgreSQL database with table schemas organized logically across domain groups.
- **Background Jobs**: Single Celery / Redis worker for background tasks.

Each module maintains internal encapsulation:
`model.py`, `schema.py`, `repository.py`, `service.py`, `router.py`, `permissions.py`, `exceptions.py`, and `tests/`.

## Consequences
- **Positive**: Simplified single-repo deployment, fast local setup, unified database transactions, seamless module refactoring, clear boundary isolation.
- **Negative**: Requires discipline to enforce module boundaries and prevent tight coupling between repositories.
