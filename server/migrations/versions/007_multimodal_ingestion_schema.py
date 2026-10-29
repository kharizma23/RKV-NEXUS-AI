"""Multimodal Assessment Ingestion Schema Migration

Revision ID: 007_multimodal_ingestion_schema
Revises: 006_explainable_assessment_schema
Create Date: 2026-07-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '007_multimodal_ingestion_schema'
down_revision: Union[str, None] = '006_explainable_assessment_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. ocr_extracted_scripts
    op.create_table(
        'ocr_extracted_scripts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('answer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_answers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('extracted_text', sa.Text(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.92'),
        sa.Column('bounding_boxes', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_ocr_extracted_scripts_answer_id'), 'ocr_extracted_scripts', ['answer_id'])

    # 2. viva_audio_transcripts
    op.create_table(
        'viva_audio_transcripts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('answer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_answers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('audio_url', sa.String(length=500), nullable=False),
        sa.Column('transcript_text', sa.Text(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('speech_confidence', sa.Float(), nullable=False, server_default='0.88'),
        sa.Column('word_timestamps', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_viva_audio_transcripts_answer_id'), 'viva_audio_transcripts', ['answer_id'])

    # 3. diagram_region_evaluations
    op.create_table(
        'diagram_region_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('answer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_answers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('diagram_url', sa.String(length=500), nullable=False),
        sa.Column('detected_components', sa.JSON(), nullable=True),
        sa.Column('missing_components', sa.JSON(), nullable=True),
        sa.Column('structural_score', sa.Float(), nullable=False, server_default='85.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_diagram_region_evaluations_answer_id'), 'diagram_region_evaluations', ['answer_id'])

def downgrade() -> None:
    op.drop_table('diagram_region_evaluations')
    op.drop_table('viva_audio_transcripts')
    op.drop_table('ocr_extracted_scripts')
