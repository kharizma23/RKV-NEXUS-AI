# Phase 7 Implementation Plan: Multimodal Assessment Ingestion (Handwritten OCR, Voice Viva & Diagram Evaluation)

This document outlines the architecture, database extensions, multimodal ingestion pipeline, OCR text span extraction, speech-to-text viva evaluator, diagram analysis engine, frontend portals, and test suite for **Phase 7**.

---

## 1. Executive Summary & Phase 7 Objectives

Phase 7 extends the platform's evaluation capabilities beyond typed text to support multimodal student submissions:

1. **Handwritten Answer Sheet OCR Engine**: Ingests uploaded image/PDF answer scripts, performs OCR text extraction, and maps character offsets to page numbers and bounding regions.
2. **Voice Viva Evaluation Engine**: Ingests recorded audio files, generates speech-to-text transcripts, and evaluates spoken responses against viva rubric criteria.
3. **Diagram Region Analysis**: Evaluates uploaded student technical diagrams, detects key components/labels, and verifies structural completeness against expected diagrams.
4. **Multimodal Evidence Integration**: Links OCR text spans, audio timestamps, and diagram region bounding boxes directly into `evaluation_evidences`.

---

## 2. Reused & Extended Components

### Existing Models to Extend:
- `StudentAnswer`: Add `handwritten_image_urls` (JSON), `viva_audio_url`, `diagram_image_url`, `ingestion_status` (`TYPED`, `OCR_PROCESSED`, `VIVA_TRANSCRIPT`, `DIAGRAM_ANALYZED`).
- `EvaluationEvidence`: Add `source_page_number`, `source_bounding_box` (JSON), `audio_timestamp_start`, `audio_timestamp_end`.

### New Database Tables (Phase 7 Migration `007_multimodal_ingestion_schema.py`):
1. `ocr_extracted_scripts`: `id`, `answer_id`, `image_url`, `page_number`, `extracted_text`, `confidence_score`, `bounding_boxes` (JSON).
2. `viva_audio_transcripts`: `id`, `answer_id`, `audio_url`, `transcript_text`, `duration_seconds`, `speech_confidence`, `word_timestamps` (JSON).
3. `diagram_region_evaluations`: `id`, `answer_id`, `diagram_url`, `detected_components` (JSON), `missing_components` (JSON), `structural_score`.

---

## 3. Proposed Backend Endpoints (`/api/v1/`)

### Multimodal Submission & Ingestion (`/api/v1/multimodal/`)
- `POST /api/v1/multimodal/upload-handwritten/{answer_id}`: Upload handwritten answer sheet image/PDF.
- `POST /api/v1/multimodal/upload-viva/{answer_id}`: Upload voice viva audio recording.
- `POST /api/v1/multimodal/upload-diagram/{answer_id}`: Upload technical diagram image.
- `GET /api/v1/multimodal/inspection/{answer_id}`: Fetch OCR text, viva transcript, and diagram region analysis.

---

## 4. Frontend Pages & UI Enhancements

### Student Submissions:
- `/student/examinations/[id]/upload-multimodal`: Drag-and-drop file uploader for handwritten scripts, voice viva recorder/uploader, and diagram image attachment.

### Faculty Inspector:
- `/faculty/evaluation/[evaluationId]/multimodal`: Side-by-side paper inspector showing handwritten image with highlighted OCR text overlays, audio waveform transcript player, and diagram region breakdown.

---

## 5. Verification & Quality Gate Plan

1. **Alembic Migration Upgrade/Downgrade Check**: `007_multimodal_ingestion_schema.py`.
2. **Backend Unit & Integration Tests (`backend/tests/test_phase7.py`)**:
   - OCR text extraction and bounding box coordinate mapping.
   - Speech-to-text transcript evaluation against viva rubrics.
   - Diagram region structural score calculation.
3. **Quality Gates**:
   - `python -m pytest`
   - `python -m ruff check .`
   - `python -m mypy app`
   - `npm run type-check`
   - `npm run test`
   - `npm run build`
