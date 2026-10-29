"""AI Evaluation Engine Schema Migration

Revision ID: 004_evaluation_engine_schema
Revises: 003_assessment_core_schema
Create Date: 2026-07-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '004_evaluation_engine_schema'
down_revision: Union[str, None] = '003_assessment_core_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. evaluation_results
    op.create_table(
        'evaluation_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_exam_attempts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('total_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('max_score', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('percentage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('grade', sa.String(length=10), nullable=False, server_default='F'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='AUTO_GRADED'),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('faculty_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evaluation_results_attempt_id'), 'evaluation_results', ['attempt_id'])

    # 2. question_evaluations
    op.create_table(
        'question_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('evaluation_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('evaluation_results.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_answers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ai_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('faculty_score', sa.Float(), nullable=True),
        sa.Column('final_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('max_score', sa.Float(), nullable=False, server_default='2.0'),
        sa.Column('ai_confidence', sa.Float(), nullable=False, server_default='0.9'),
        sa.Column('ai_rationale', sa.Text(), nullable=True),
        sa.Column('matched_key_points', sa.JSON(), nullable=True),
        sa.Column('missing_key_points', sa.JSON(), nullable=True),
        sa.Column('faculty_feedback', sa.Text(), nullable=True),
        sa.Column('is_overridden', sa.Boolean(), nullable=False, server_default='false')
    )
    op.create_index(op.f('ix_question_evaluations_evaluation_result_id'), 'question_evaluations', ['evaluation_result_id'])
    op.create_index(op.f('ix_question_evaluations_answer_id'), 'question_evaluations', ['answer_id'])
    op.create_index(op.f('ix_question_evaluations_question_id'), 'question_evaluations', ['question_id'])

def downgrade() -> None:
    op.drop_table('question_evaluations')
    op.drop_table('evaluation_results')
