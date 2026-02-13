"""Add sleep tracking fields to daily_entries

Revision ID: 002
Revises: 001
Create Date: 2026-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('daily_entries') as batch_op:
        batch_op.add_column(sa.Column('sleep_hours', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('sleep_quality', sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('daily_entries') as batch_op:
        batch_op.drop_column('sleep_quality')
        batch_op.drop_column('sleep_hours')
