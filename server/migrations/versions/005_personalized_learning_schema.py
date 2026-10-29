"""Personalized Remedial Learning Schema Migration

Revision ID: 005_personalized_learning_schema
Revises: 004_evaluation_engine_schema
Create Date: 2026-07-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '005_personalized_learning_schema'
down_revision: Union[str, None] = '004_evaluation_engine_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. misconception_catalogs
    op.create_table(
        'misconception_catalogs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('remedial_guidance', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_misconception_catalogs_topic_id'), 'misconception_catalogs', ['topic_id'])
    op.create_index(op.f('ix_misconception_catalogs_code'), 'misconception_catalogs', ['code'])

    # 2. student_knowledge_states
    op.create_table(
        'student_knowledge_states',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mastery_level', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='DEVELOPING'),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_student_knowledge_states_student_id'), 'student_knowledge_states', ['student_id'])
    op.create_index(op.f('ix_student_knowledge_states_topic_id'), 'student_knowledge_states', ['topic_id'])

    # 3. remedial_learning_plans
    op.create_table(
        'remedial_learning_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('weak_topics', sa.JSON(), nullable=True),
        sa.Column('recommended_resources', sa.JSON(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_remedial_learning_plans_student_id'), 'remedial_learning_plans', ['student_id'])
    op.create_index(op.f('ix_remedial_learning_plans_subject_id'), 'remedial_learning_plans', ['subject_id'])

def downgrade() -> None:
    op.drop_table('remedial_learning_plans')
    op.drop_table('student_knowledge_states')
    op.drop_table('misconception_catalogs')
