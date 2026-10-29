"""add_notifications_schema

Revision ID: 137f3bef3ef9
Revises: 009_programme_management_enhancements
Create Date: 2026-08-03 16:32:57.128870+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '137f3bef3ef9'
down_revision: Union[str, None] = '009_programme_management_enhancements'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('sender_type', sa.String(length=50), nullable=False, server_default='SYSTEM'),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('recipient_type', sa.String(length=50), nullable=False, server_default='ALL'),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('programme_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('semester_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['institution_id'], ['institutions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['programme_id'], ['programmes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['semester_id'], ['semesters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL')
    )

    # 2. Create notification_reads table
    op.create_table(
        'notification_reads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('notification_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['notification_id'], ['notifications.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_notification_reads_notification_id', 'notification_reads', ['notification_id'])
    op.create_index('ix_notification_reads_student_id', 'notification_reads', ['student_id'])

    # 3. Create notification_settings table
    op.create_table(
        'notification_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('exam_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('result_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('assignment_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('faculty_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('learning_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('placement_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('announcement_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('browser_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_notification_settings_user_id', 'notification_settings', ['user_id'])

    # 4. Create notification_attachments table
    op.create_table(
        'notification_attachments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('notification_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['notification_id'], ['notifications.id'], ondelete='CASCADE')
    )
    op.create_index('ix_notification_attachments_notification_id', 'notification_attachments', ['notification_id'])

def downgrade() -> None:
    op.drop_table('notification_attachments')
    op.drop_table('notification_settings')
    op.drop_table('notification_reads')
    op.drop_table('notifications')
