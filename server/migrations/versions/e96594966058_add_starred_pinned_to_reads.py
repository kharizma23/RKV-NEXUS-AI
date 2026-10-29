"""add_starred_pinned_to_reads

Revision ID: e96594966058
Revises: 137f3bef3ef9
Create Date: 2026-08-03 16:49:53.000000+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e96594966058'
down_revision: Union[str, None] = '137f3bef3ef9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('notification_reads', sa.Column('is_starred', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('notification_reads', sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='false'))

def downgrade() -> None:
    op.drop_column('notification_reads', 'is_pinned')
    op.drop_column('notification_reads', 'is_starred')
