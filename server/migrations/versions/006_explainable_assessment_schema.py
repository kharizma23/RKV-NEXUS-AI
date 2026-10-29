"""Explainable Assessment Schema Migration

Revision ID: 006_explainable_assessment_schema
Revises: 005_personalized_learning_schema
Create Date: 2026-07-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '006_explainable_assessment_schema'
down_revision: Union[str, None] = '005_personalized_learning_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. evaluation_evidences
    op.create_table(
        'evaluation_evidences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question_evaluation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('question_evaluations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('criterion_id', sa.String(length=50), nullable=False),
        sa.Column('criterion_title', sa.String(length=255), nullable=False),
        sa.Column('max_mark', sa.Float(), nullable=False, server_default='2.0'),
        sa.Column('suggested_mark', sa.Float(), nullable=False, server_default='2.0'),
        sa.Column('faculty_mark', sa.Float(), nullable=True),
        sa.Column('evidence_type', sa.String(length=50), nullable=False, server_default='EXACT_TEXT_SPAN'),
        sa.Column('evidence_text', sa.Text(), nullable=False),
        sa.Column('start_offset', sa.Integer(), nullable=True),
        sa.Column('end_offset', sa.Integer(), nullable=True),
        sa.Column('matched_key_concepts', sa.JSON(), nullable=True),
        sa.Column('missing_key_concepts', sa.JSON(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.9'),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('evaluation_method', sa.String(length=50), nullable=False, server_default='DETERMINISTIC_FALLBACK'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evaluation_evidences_question_evaluation_id'), 'evaluation_evidences', ['question_evaluation_id'])

    # 2. counterfactual_feedbacks
    op.create_table(
        'counterfactual_feedbacks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question_evaluation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('question_evaluations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('current_score', sa.Float(), nullable=False),
        sa.Column('target_score', sa.Float(), nullable=False),
        sa.Column('required_improvements', sa.JSON(), nullable=True),
        sa.Column('generated_feedback', sa.Text(), nullable=False),
        sa.Column('approved_feedback', sa.Text(), nullable=True),
        sa.Column('is_faculty_approved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_counterfactual_feedbacks_question_evaluation_id'), 'counterfactual_feedbacks', ['question_evaluation_id'])

    # 3. question_quality_reports
    op.create_table(
        'question_quality_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('exam_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False, server_default='85.0'),
        sa.Column('component_scores', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PASSED'),
        sa.Column('has_blocking_issues', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_question_quality_reports_exam_id'), 'question_quality_reports', ['exam_id'])

    # 4. question_quality_findings
    op.create_table(
        'question_quality_findings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('question_quality_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='INFO'),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('suggested_correction', sa.Text(), nullable=True),
        sa.Column('rule_code', sa.String(length=50), nullable=False),
        sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolution_comment', sa.Text(), nullable=True)
    )
    op.create_index(op.f('ix_question_quality_findings_report_id'), 'question_quality_findings', ['report_id'])

    # 5. grade_review_requests
    op.create_table(
        'grade_review_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_exam_attempts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('review_category', sa.String(length=50), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('requested_action', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SUBMITTED'),
        sa.Column('faculty_decision_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_grade_review_requests_attempt_id'), 'grade_review_requests', ['attempt_id'])
    op.create_index(op.f('ix_grade_review_requests_student_id'), 'grade_review_requests', ['student_id'])

    # 6. remedial_activities
    op.create_table(
        'remedial_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('remedial_plan_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('remedial_learning_plans.id', ondelete='CASCADE'), nullable=False),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False),
        sa.Column('misconception_code', sa.String(length=50), nullable=True),
        sa.Column('activity_type', sa.String(length=50), nullable=False, server_default='PRACTICE_EXERCISE'),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.JSON(), nullable=True),
        sa.Column('estimated_minutes', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_remedial_activities_remedial_plan_id'), 'remedial_activities', ['remedial_plan_id'])

    # 7. remedial_activity_attempts
    op.create_table(
        'remedial_activity_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('remedial_activities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('score', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('time_spent_seconds', sa.Integer(), nullable=False, server_default='300'),
        sa.Column('confidence_rating', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='COMPLETED')
    )

    # 8. reassessment_definitions
    op.create_table(
        'reassessment_definitions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('topic_ids', sa.JSON(), nullable=True),
        sa.Column('total_marks', sa.Float(), nullable=False, server_default='10.0'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 9. reassessment_attempts
    op.create_table(
        'reassessment_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reassessment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reassessment_definitions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('pre_remediation_score', sa.Float(), nullable=False, server_default='45.0'),
        sa.Column('post_remediation_score', sa.Float(), nullable=False, server_default='85.0'),
        sa.Column('score_delta', sa.Float(), nullable=False, server_default='40.0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='COMPLETED'),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 10. mastery_histories
    op.create_table(
        'mastery_histories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False),
        sa.Column('previous_mastery', sa.Float(), nullable=False),
        sa.Column('new_mastery', sa.Float(), nullable=False),
        sa.Column('evidence_source', sa.String(length=100), nullable=False),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_mastery_histories_student_id'), 'mastery_histories', ['student_id'])

    # 11. ai_operation_logs
    op.create_table(
        'ai_operation_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('operation_type', sa.String(length=50), nullable=False),
        sa.Column('provider_name', sa.String(length=50), nullable=False, server_default='DETERMINISTIC_LOCAL'),
        sa.Column('model_name', sa.String(length=50), nullable=False, server_default='v1.0'),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.9'),
        sa.Column('duration_ms', sa.Integer(), nullable=False, server_default='120'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='SUCCESS'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_ai_operation_logs_operation_type'), 'ai_operation_logs', ['operation_type'])

def downgrade() -> None:
    op.drop_table('ai_operation_logs')
    op.drop_table('mastery_histories')
    op.drop_table('reassessment_attempts')
    op.drop_table('reassessment_definitions')
    op.drop_table('reassessment_activity_attempts')
    op.drop_table('remedial_activities')
    op.drop_table('grade_review_requests')
    op.drop_table('question_quality_findings')
    op.drop_table('question_quality_reports')
    op.drop_table('counterfactual_feedbacks')
    op.drop_table('evaluation_evidences')
