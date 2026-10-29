# Phase 6 Implementation Plan: Explainable Assessment Intelligence, Question Quality Validation and Closed-Loop Reassessment

This document outlines the detailed architecture, database extensions, AI provider abstraction, new backend domain modules, API endpoints, frontend portals, and testing strategy for **Phase 6**.

---

## 1. Executive Summary & Phase 6 Objectives

Phase 6 introduces the core novelty features that transform assessment into a transparent, closed-loop learning experience:

1. **Evidence-Linked Explainable Grading**: Connects rubric criteria to exact character offsets/spans in student responses, matched key concepts, and confidence scores.
2. **Counterfactual Grade Explanation**: Provides actionable feedback showing minimum required improvements to reach higher score bands.
3. **Evaluation Confidence Routing**: Routes evaluations to faculty review queues based on multi-component confidence thresholds (High, Medium, Low).
4. **Faculty Moderation Workspace**: Enhanced review queue with criterion-by-criterion evidence highlights, score override controls, and immutable audit logs.
5. **Question-Paper Quality Gate**: Pre-publication validation engine checking syllabus coverage, CO alignment, difficulty/Bloom's balance, duplicate questions, ambiguous wording, and blocking errors.
6. **Structured Grade-Review Workflow**: Student post-publication appeal process with faculty review queues and status tracking.
7. **Closed-Loop Remedial Practice**: Practice activities (worked examples, flashcards, short-answer exercises) linked to identified misconceptions.
8. **Reassessment Workflow**: Targeted post-remediation assessments that calculate score improvements and update topic mastery.
9. **Mastery-History Tracking**: Append-only audit history of topic mastery evolution.
10. **AI Decision Auditability**: Structured logging of all AI operations (provider, model, prompt version, confidence, latency, input references).

---

## 2. Reused & Extended Components

### Existing Models to Extend:
- `Question`: Add quality validation flags, rubric criteria metadata.
- `Examination`: Add quality score, publication block status, quality report relation.
- `QuestionEvaluation`: Add evidence text, character offsets, counterfactual feedback, AI confidence breakdown.
- `StudentKnowledgeState`: Retain current status while appending to new `MasteryHistory` records.

### New Database Tables (Phase 6 Migration `006_explainable_assessment_schema.py`):
1. `evaluation_evidences`: Character offsets, rubric criterion IDs, matched/missing concepts, page/region info.
2. `question_quality_reports`: Overall paper quality score, component scores, status.
3. `question_quality_findings`: Quality issues (Syllabus coverage, Bloom's balance, duplication, ambiguity) with severity levels (`INFO`, `WARNING`, `ERROR`, `BLOCKING`).
4. `grade_review_requests`: Post-publication student appeal tickets with workflow status (`SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`).
5. `remedial_activities`: Targeted practice exercises (Worked Examples, Flashcards, Mini Assessments).
6. `reassessment_attempts`: Targeted post-remediation assessments with pre/post score delta calculation.
7. `mastery_histories`: Append-only historical log of student topic mastery transitions.
8. `ai_operation_logs`: Immutable audit log of all AI calls (sanitized, no secrets or raw passwords).

---

## 3. AI Provider Abstraction Layer (`backend/app/ai/`)

We will create a clean provider abstraction inside `backend/app/ai/`:
- `providers/base.py`: Abstract Base Class for AI Evaluators.
- `providers/deterministic.py`: Deterministic fallback evaluator for development and local testing.
- `providers/openai_provider.py` / `external.py`: Configurable LLM provider with structured Pydantic output validation.
- `schemas/`: Pydantic output schemas for evidence extraction, counterfactual feedback, and quality validation.
- `evaluators/`: Explainable rubric matcher and paper quality checker.

---

## 4. Proposed Backend Endpoints (`/api/v1/`)

### Explainable Grading & Moderation (`/api/v1/evaluation/`)
- `GET /api/v1/evaluation/{evaluation_id}/explanation`: Detailed evidence breakdown.
- `PATCH /api/v1/evaluation/criterion-score/{criterion_eval_id}`: Override criterion score with audit reason.
- `POST /api/v1/evaluation/{attempt_id}/approve`: Approve AI evaluation.

### Question Quality Gate (`/api/v1/examinations/`)
- `POST /api/v1/examinations/{exam_id}/validate-quality`: Run pre-publication quality gate.
- `GET /api/v1/examinations/{exam_id}/quality-report`: Fetch component scores and findings.
- `PATCH /api/v1/examinations/quality-findings/{finding_id}/resolve`: Faculty resolution or admin override.

### Grade Review Workflow (`/api/v1/grade-reviews/`)
- `POST /api/v1/grade-reviews`: Student submits grade appeal.
- `GET /api/v1/grade-reviews/queue`: Faculty review queue.
- `PATCH /api/v1/grade-reviews/{review_id}/decide`: Accept, partially accept, or reject appeal.

### Closed-Loop Remediation & Reassessment (`/api/v1/reassessment/`)
- `POST /api/v1/reassessment/generate/{student_id}/{subject_id}`: Generate targeted reassessment.
- `POST /api/v1/reassessment/{reassessment_id}/submit`: Submit reassessment & update mastery history.
- `GET /api/v1/mastery/history/{student_id}`: Fetch append-only mastery history timeline.

---

## 5. Frontend Pages & UI Enhancements

### Faculty Portals:
- `/faculty/evaluation/[evaluationId]`: Detailed evidence viewer with text span highlighting, counterfactual suggestions, and override panel.
- `/faculty/examinations/[examId]/quality`: Quality gate dashboard showing component breakdown bars, blocking findings alerts, and resolution controls.
- `/faculty/grade-reviews`: Grade review queue and decision modal.

### Student Portals:
- `/student/results/[resultId]`: Enhanced scorecard with evidence-linked explanations, missing concept badges, counterfactual guidance ("How to reach 9/10"), and grade-review request button.
- `/student/grade-reviews`: Student grade-review ticket tracking.
- `/student/reassessments/[reassessmentId]`: Targeted reassessment workspace.
- `/student/mastery`: Interactive mastery history timeline chart.

---

## 6. Verification & Quality Gate Plan

1. **Alembic Migration Upgrade/Downgrade Check**: `006_explainable_assessment_schema.py`.
2. **Backend Unit & Integration Tests (`backend/tests/test_phase6.py`)**:
   - Evidence character offset matching and fallback handling.
   - Confidence routing (High vs Medium vs Low).
   - Question paper quality gate blocking publication.
   - Grade review appeal workflow and audit logs.
   - Reassessment attempt execution and mastery history append.
3. **Frontend Tests**:
   - Component tests (Vitest) for Evidence highlighting & Quality Gate findings.
   - E2E Playwright tests (`frontend/tests/e2e/phase6.spec.ts`).
4. **Static Quality Gates**: Pytest, Ruff check, Mypy check, TypeScript type-check, Next.js build.
