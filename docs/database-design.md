# Database Design Specification

## Schema Overview (51 Tables across 8 Alembic Migrations)

### Auth & Core Users Domain (Migration 001 & 008)
- `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens`, `login_attempts`, `audit_logs`.
- `faculty_approval_events` (Table #51): `id`, `faculty_user_id`, `action`, `previous_status`, `new_status`, `administrator_id`, `reason`, `created_at`.

### Academic Structure Domain (Migration 001, 002, 008)
- `institutions`, `departments`, `programmes`, `academic_years`, `semesters`, `courses`, `course_outcomes`, `subjects`, `student_profiles`, `faculty_profiles`, `student_enrolments`.
- **Extended Columns on `users`**: `account_status`, `failed_login_count`, `locked_until`, `last_login_at`.
- **Extended Columns on `student_profiles`**: `institution_id`, `programme_id`, `academic_year_id`, `semester_id`, `preferred_language`, `phone_number`, `date_of_birth`.
- **Extended Columns on `faculty_profiles`**: `institution_id`, `phone_number`, `subjects_handled`, `approval_status`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `rejection_reason`.

### Assessment Core & Blueprinting Domain (Migration 003)
- `question_banks`, `questions`, `rubrics`, `rubric_criteria`, `assessment_blueprints`, `blueprint_topics`, `examinations`, `exam_questions`, `student_exam_sessions`, `student_answers`.

### AI Evaluation & Moderation Domain (Migration 004)
- `evaluation_batches`, `ai_evaluations`, `evidence_spans`, `evaluation_feedbacks`, `faculty_moderations`.

### Personalized Learning Domain (Migration 005)
- `misconception_catalogs`, `student_misconceptions`, `student_mastery_maps`, `remedial_learning_plans`, `remedial_activities`, `activity_submissions`.

### Explainable Intelligence Domain (Migration 006)
- `score_counterfactuals`, `paper_quality_gates`, `grade_review_requests`, `reassessment_definitions`, `reassessment_attempts`, `mastery_histories`, `ai_operation_logs`.

### Multimodal Assessment Ingestion Domain (Migration 007)
- `ocr_extracted_scripts`, `viva_audio_transcripts`, `diagram_region_evaluations`.
