"""Add text_quota to user model

Revision ID: c5e8f7g9h0i1
Revises: a2b3c4d5e6f7
Create Date: 2025-07-30 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c5e8f7g9h0i1'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('text_quota', sa.Integer(), nullable=True, server_default='1000'))


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('text_quota')
