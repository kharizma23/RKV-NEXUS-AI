<p align="center">
  <h1 align="center">🎓 RKV NEXUS AI</h1>
  <p align="center">
    <strong>Integrated AI Platform for Academic Assessment, Evaluation & Personalized Learning</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" />
  </p>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Development Seed Accounts](#development-seed-accounts)

---

## Overview

**RKV NEXUS AI** is a comprehensive, AI-powered academic assessment platform designed to transform how educational institutions conduct examinations, evaluate student performance, and deliver personalized learning pathways.

The platform integrates advanced AI capabilities — including semantic answer scoring, misconception detection, proctoring analytics, blockchain certificates, and predictive analytics — into a unified system serving **Students**, **Faculty**, **Administrators**, and **Parents**.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        RKV NEXUS AI Platform                        │
├───────────────────────────┬──────────────────────────────────────────┤
│                           │                                          │
│      client/ (Client)     │          server/ (Server)                │
│      ─────────────────    │          ─────────────────               │
│    Next.js 14 (App Router)│         FastAPI + SQLAlchemy             │
│    React 18 + TypeScript  │         Python 3.12 + Pydantic v2       │
│    Tailwind CSS           │         Async PostgreSQL                 │
│    Port: 3000             │         Port: 8000                       │
│                           │                                          │
├───────────────────────────┴──────────────────────────────────────────┤
│                        Infrastructure                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ PostgreSQL 16│  │   Redis 7    │  │  MinIO (S3)  │               │
│  │  Port: 5432  │  │  Port: 6379  │  │ Port: 9000   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
rkv-nexus-ai/
│
├── server/                         # 🐍 FastAPI Server (Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Application entry point
│   │   ├── ai/                     # AI/ML services (Gemini, OpenCV)
│   │   ├── api/                    # API versioning & route aggregation
│   │   │   └── v1/router.py
│   │   ├── core/                   # Config, security, logging, exceptions
│   │   ├── database/               # SQLAlchemy engine, session, seed
│   │   └── modules/                # Feature modules (46 domains)
│   │       ├── auth/               # Authentication & authorization
│   │       ├── academics/          # Institutions, departments, programmes
│   │       ├── assessment_attempts/ # Exam sessions & autosave
│   │       ├── evaluation/         # AI-powered answer scoring
│   │       ├── exam_conduction_evaluation/  # Proctoring, grading
│   │       ├── new_functionalities/ # 15 advanced AI features
│   │       ├── personalized_learning/ # Mastery maps, practice
│   │       ├── certificates/       # Blockchain verification
│   │       ├── gamification/       # Badges, leaderboards
│   │       ├── predictions/        # Dropout & performance prediction
│   │       └── ...                 # 36 more domain modules
│   ├── migrations/                 # Alembic database migrations
│   ├── tests/                      # Pytest test suite
│   ├── uploads/                    # File upload storage
│   ├── Dockerfile                  # Container configuration
│   ├── requirements.txt            # Python dependencies
│   ├── pyproject.toml              # Project metadata & tool config
│   └── alembic.ini                 # Migration configuration
│
├── client/                         # ⚛️ Next.js Client (TypeScript)
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── (auth)/             # Login, register, verify
│   │   │   ├── admin/              # Admin dashboard & management
│   │   │   ├── faculty/            # Faculty dashboard & tools
│   │   │   ├── student/            # Student dashboard & learning
│   │   │   ├── parent/             # Parent portal
│   │   │   ├── certificates/       # Public certificate verification
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── globals.css         # Global styles
│   │   ├── components/             # Reusable UI components (57 domains)
│   │   │   ├── layout/             # Sidebar, header, navigation
│   │   │   ├── ui/                 # Base UI primitives
│   │   │   ├── doubts/             # AI doubt detection
│   │   │   ├── student360/         # Student 360° profile
│   │   │   ├── proctoring/         # Exam proctoring views
│   │   │   └── ...                 # 52 more component modules
│   │   ├── lib/                    # Utilities, API client, helpers
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── data/                   # Static data & constants
│   │   └── providers/              # React context providers
│   ├── tests/                      # Vitest & Playwright tests
│   ├── package.json                # Node.js dependencies
│   ├── next.config.mjs             # Next.js configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── vitest.config.ts            # Test configuration
│
├── docs/                           # 📚 Project documentation
│   ├── architecture.md
│   ├── database-design.md
│   ├── security.md
│   └── ...
│
├── scripts/                        # 🛠️ Setup & utility scripts
│   ├── setup.ps1                   # Windows setup
│   ├── setup.sh                    # Linux/Mac setup
│   ├── seed.ps1                    # Windows database seeding
│   └── seed.sh                     # Linux/Mac database seeding
│
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Infrastructure services
├── package.json                    # Root scripts (dev, test, build)
└── README.md                       # This file
```

---

## Technology Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Client** | Next.js 14, React 18, TypeScript | App Router, SSR, strict type safety |
| **Styling** | Tailwind CSS, shadcn/ui patterns | Responsive design system |
| **State** | TanStack Query, React Hook Form | Server state & form management |
| **Validation** | Zod | Runtime schema validation |
| **Icons** | Lucide React | Consistent iconography |
| **Charts** | Recharts | Data visualization |
| **Server** | FastAPI, Python 3.12 | Async API framework |
| **ORM** | SQLAlchemy 2 (Async + Sync) | Database abstraction |
| **Migrations** | Alembic | Schema version control |
| **Auth** | PyJWT, Argon2id | Token auth with password hashing |
| **Database** | PostgreSQL 16 + pgvector | Relational + vector embeddings |
| **Cache** | Redis 7 | Session cache, rate limiting |
| **Storage** | MinIO (S3-compatible) | File & media storage |
| **AI** | Google Gemini API | AI evaluation & generation |
| **Testing** | Pytest, Vitest, Playwright | Server + client + E2E |
| **Linting** | Ruff, Mypy, ESLint | Code quality enforcement |
| **Containers** | Docker Compose | Local infrastructure |

---

## Features

### 🏗️ Core Platform (Phases 0–7)
- **Authentication & Authorization** — JWT, refresh token rotation, 2FA, brute-force protection
- **Academic Management** — Institutions, departments, programmes, course outcomes
- **Question Bank & Blueprinting** — Structured exam creation with CO/Bloom's mapping
- **Exam Scheduling & Conduction** — Session management, autosave, timer controls
- **AI Evaluation** — Semantic answer scoring, evidence-linked grading, faculty moderation
- **Personalized Learning** — Misconception detection, mastery maps, targeted practice
- **Explainable Assessment** — Evidence spans, counterfactual guidance, grade reviews
- **Multimodal Ingestion** — OCR scripts (PaddleOCR), viva transcripts (Whisper), diagram evaluation

### 🤖 AI-Powered Features
- **AI Proctoring** — Face detection, gaze tracking, phone detection, risk scoring
- **Blockchain Certificates** — Tamper-proof credentials with QR verification
- **AI Doubt Detection** — Identifies conceptual gaps from wrong answers, suggests micro-lessons
- **Student 360° Profile** — Holistic view of academic, behavioral & wellness data
- **Smart Revision Scheduler** — Spaced repetition based on forgetting curves
- **AI Lecture Summarizer** — Generates structured summaries from lecture content
- **Faculty Performance Dashboard** — Multi-dimensional performance analytics
- **QR Attendance** — Time-limited QR codes with GPS verification
- **Digital Portfolio** — Curated academic & project showcase
- **Exam Variant Generator** — AI-powered parallel exam paper generation
- **Career Prediction** — ML-based career path recommendations
- **Mental Health Alerts** — Behavioral pattern analysis for early intervention
- **Academic Competitions** — Intra/inter-institutional challenge management
- **Content Recommendations** — Personalized learning resource suggestions
- **Digital Student ID** — Secure digital identity with QR verification
- **Live Engagement Tracking** — Real-time classroom participation analytics

### 📊 Analytics & Intelligence
- **Dropout Prediction** — Early warning system with intervention workflows
- **Global Benchmarking** — Cross-institutional performance comparison
- **Knowledge Graphs** — Visual concept relationship mapping
- **Skill Gap Analysis** — Industry-aligned competency tracking
- **Gamification** — Badges, streaks, leaderboards, XP systems

---

## Quick Start

### Prerequisites

- **Python** 3.12+
- **Node.js** v20+ (v22 recommended)
- **PostgreSQL** 16+ (or Docker)
- **Redis** 7+ (or Docker)

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/rkv-nexus-ai.git
cd rkv-nexus-ai

# 2. Copy environment template
cp .env.example .env

# 3. Start infrastructure services
docker compose up -d

# 4. Setup server & client
# Windows:
.\scripts\setup.ps1
# Linux/Mac:
./scripts/setup.sh

# 5. Run database migrations & seed
cd server
.venv/Scripts/Activate.ps1    # Windows
# source .venv/bin/activate   # Linux/Mac
alembic upgrade head
python -m app.database.seed
cd ..

# 6. Start development servers
npm run dev
```

### Option 2: Manual Setup

```bash
# Server
cd server
python -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python -m app.database.seed
uvicorn app.main:app --reload --port 8000

# Client (new terminal)
cd client
npm install
npm run dev
```

### Access Points

| Service | URL |
|:--------|:----|
| **Client App** | http://localhost:3000 |
| **Server API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/api/v1/docs |
| **API Docs (ReDoc)** | http://localhost:8000/api/v1/redoc |
| **MinIO Console** | http://localhost:9001 |

---

## Development

### Running Development Servers

```bash
# Both client & server simultaneously
npm run dev

# Server only
npm run dev:server

# Client only
npm run dev:client
```

### Code Quality

```bash
# Server linting
cd server
ruff check .
mypy app

# Client linting & type checking
npm run lint:client
npm run type-check
```

---

## Testing

### Server Tests (Pytest)

```bash
npm run test:server
# or
cd server && pytest -v
```

### Client Tests (Vitest)

```bash
npm run test:client
# or
cd client && npm run test
```

### Run All Tests

```bash
npm run test
```

---

## Deployment

### Docker Production Build

```bash
docker compose up -d --build
```

### Environment Variables

Copy `.env.example` and configure all required variables:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` — PostgreSQL async connection string
- `SYNC_DATABASE_URL` — PostgreSQL sync connection string
- `REDIS_HOST` — Redis server hostname
- `JWT_SECRET_KEY` — JWT signing secret
- `GEMINI_API_KEY` — Google Gemini API key
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` — Object storage credentials

---

## API Documentation

Once the server is running, interactive API docs are available at:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

All endpoints follow RESTful conventions under the `/api/v1/` prefix.

---

## Development Seed Accounts

> ⚠️ **DEVELOPMENT ONLY** — Change all passwords before any public deployment.

| Role | Email | Password | Status |
|:-----|:------|:---------|:-------|
| **Administrator** | `admin@platform.edu` | `AdminPassword123!` | Active, Verified |
| **Faculty (Approved)** | `faculty.approved@platform.edu` | `FacultyPassword123!` | Active, Approved |
| **Faculty (Pending)** | `faculty.pending@platform.edu` | `FacultyPassword123!` | Pending Approval |
| **Student (Verified)** | `student@platform.edu` | `StudentPassword123!` | Active, Verified |
| **Student (Unverified)** | `student.unverified@platform.edu` | `StudentPassword123!` | Pending Verification |

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ for <strong>RKV Educational Institution</strong>
</p>
