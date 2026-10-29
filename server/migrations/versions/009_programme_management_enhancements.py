"""Programme Management Workflow Enhancements Schema Migration

Revision ID: 009_programme_management_enhancements
Revises: 008_auth_registration_approval_schema
Create Date: 2026-07-30

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '009_programme_management_enhancements'
down_revision: Union[str, None] = '008_auth_registration_approval_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Add institution_id to programmes table with fallback from departments table
    op.add_column('programmes', sa.Column('institution_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("""
        UPDATE programmes p
        SET institution_id = d.institution_id
        FROM departments d
        WHERE p.department_id = d.id
    """)
    op.execute("""
        UPDATE programmes
        SET institution_id = (SELECT id FROM institutions LIMIT 1)
        WHERE institution_id IS NULL
    """)
    op.alter_column('programmes', 'institution_id', nullable=False)
    op.create_foreign_key('fk_programmes_institution_id', 'programmes', 'institutions', ['institution_id'], ['id'], ondelete='CASCADE')
    op.create_index('ix_programmes_institution_id', 'programmes', ['institution_id'])

    # 2. Add total_semesters, regulation_name, description, is_active, created_by
    op.add_column('programmes', sa.Column('total_semesters', sa.Integer(), nullable=False, server_default='8'))
    op.add_column('programmes', sa.Column('regulation_name', sa.String(length=100), nullable=True))
    op.add_column('programmes', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('programmes', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('programmes', sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_programmes_created_by', 'programmes', 'users', ['created_by'], ['id'], ondelete='SET NULL')

    # 3. Add unique constraint for (institution_id, code)
    try:
        op.drop_index('ix_programmes_code', table_name='programmes')
    except Exception:
        pass
    op.create_index('ix_programmes_code', 'programmes', ['code'])
    op.create_unique_constraint('uq_programmes_institution_code', 'programmes', ['institution_id', 'code'])

def downgrade() -> None:
    try:
        op.drop_constraint('uq_programmes_institution_code', 'programmes', type_='unique')
    except Exception:
        pass
    op.drop_constraint('fk_programmes_created_by', 'programmes', type_='foreignkey')
    op.drop_constraint('fk_programmes_institution_id', 'programmes', type_='foreignkey')
    op.drop_index('ix_programmes_institution_id', table_name='programmes')
    op.drop_column('programmes', 'created_by')
    op.drop_column('programmes', 'is_active')
    op.drop_column('programmes', 'description')
    op.drop_column('programmes', 'regulation_name')
    op.drop_column('programmes', 'total_semesters')
    op.drop_column('programmes', 'institution_id')
