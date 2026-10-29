"""add_exam_assignments_and_exam_fields

Revision ID: 978cabdbae02
Revises: 37c85de40b59
Create Date: 2026-08-28 10:44:16.060306+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '978cabdbae02'
down_revision: Union[str, None] = '37c85de40b59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Add missing fields to examinations
    op.add_column('examinations', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('examinations', sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'))
    op.add_column('examinations', sa.Column('question_count', sa.Integer(), nullable=True))

    # 2. Create exam_assignments table
    op.create_table(
        'exam_assignments',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True),
        sa.Column('exam_id', sa.UUID(as_uuid=True), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='assigned'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('marks_obtained', sa.Float(), nullable=True),
        sa.Column('co_attainment', sa.JSON(), nullable=True),
        sa.Column('feedback_recommendations', sa.JSON(), nullable=True),
        sa.Column('question_breakdown', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_exam_assignments_exam_id'), 'exam_assignments', ['exam_id'])
    op.create_index(op.f('ix_exam_assignments_student_id'), 'exam_assignments', ['student_id'])

def downgrade() -> None:
    op.drop_table('exam_assignments')
    op.drop_column('examinations', 'question_count')
    op.drop_column('examinations', 'status')
    op.drop_column('examinations', 'description')

