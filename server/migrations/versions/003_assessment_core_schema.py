"""Assessment Core Schema Migration

Revision ID: 003_assessment_core_schema
Revises: 002_academic_management_schema
Create Date: 2026-07-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '003_assessment_core_schema'
down_revision: Union[str, None] = '002_academic_management_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. questions
    op.create_table(
        'questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('units.id', ondelete='SET NULL'), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id', ondelete='SET NULL'), nullable=True),
        sa.Column('co_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('course_outcomes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('question_type', sa.String(length=50), nullable=False, server_default='MCQ'),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('bloom_level', sa.String(length=50), nullable=False, server_default='APPLY'),
        sa.Column('default_marks', sa.Float(), nullable=False, server_default='2.0'),
        sa.Column('negative_marks', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('rubric', sa.Text(), nullable=True),
        sa.Column('created_by_faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_questions_subject_id'), 'questions', ['subject_id'])
    op.create_index(op.f('ix_questions_unit_id'), 'questions', ['unit_id'])
    op.create_index(op.f('ix_questions_topic_id'), 'questions', ['topic_id'])

    # 2. question_options
    op.create_table(
        'question_options',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('option_text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0')
    )
    op.create_index(op.f('ix_question_options_question_id'), 'question_options', ['question_id'])

    # 3. assessment_blueprints
    op.create_table(
        'assessment_blueprints',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('total_marks', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='120'),
        sa.Column('easy_pct', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('medium_pct', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('hard_pct', sa.Integer(), nullable=False, server_default='20'),
        sa.Column('unit_distributions', sa.JSON(), nullable=True),
        sa.Column('bloom_distributions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_assessment_blueprints_subject_id'), 'assessment_blueprints', ['subject_id'])

    # 4. examinations
    op.create_table(
        'examinations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('blueprint_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('assessment_blueprints.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('exam_type', sa.String(length=50), nullable=False, server_default='MID_TERM'),
        sa.Column('total_marks', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='120'),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('shuffle_questions', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('shuffle_options', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('has_negative_marking', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_by_faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_examinations_subject_id'), 'examinations', ['subject_id'])

    # 5. exam_questions
    op.create_table(
        'exam_questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('exam_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('marks', sa.Float(), nullable=False, server_default='2.0'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0')
    )
    op.create_index(op.f('ix_exam_questions_exam_id'), 'exam_questions', ['exam_id'])

    # 6. student_exam_attempts
    op.create_table(
        'student_exam_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('exam_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='IN_PROGRESS'),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('max_score', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('tab_switch_count', sa.Integer(), nullable=False, server_default='0')
    )
    op.create_index(op.f('ix_student_exam_attempts_exam_id'), 'student_exam_attempts', ['exam_id'])
    op.create_index(op.f('ix_student_exam_attempts_student_id'), 'student_exam_attempts', ['student_id'])

    # 7. student_answers
    op.create_table(
        'student_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_exam_attempts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('selected_option_ids', sa.JSON(), nullable=True),
        sa.Column('text_response', sa.Text(), nullable=True),
        sa.Column('numerical_response', sa.Float(), nullable=True),
        sa.Column('is_flagged_for_review', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('score_awarded', sa.Float(), nullable=True),
        sa.Column('evaluator_feedback', sa.Text(), nullable=True),
        sa.Column('answered_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_student_answers_attempt_id'), 'student_answers', ['attempt_id'])

def downgrade() -> None:
    op.drop_table('student_answers')
    op.drop_table('student_exam_attempts')
    op.drop_table('exam_questions')
    op.drop_table('examinations')
    op.drop_table('assessment_blueprints')
    op.drop_table('question_options')
    op.drop_table('questions')
