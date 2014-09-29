"""from_tag_v_0_1_to_revision_188

Revision ID: 2249b776493
Revises: None
Create Date: 2014-09-29 22:15:11.425484

"""

# revision identifiers, used by Alembic.
revision = '2249b776493'
down_revision = None

from alembic import op
import sqlalchemy as sa


def upgrade():
  """
  """
  # projects.local_hg_release has been renamed in projects.dvcs_release
  op.alter_column('projects', 'local_hg_release', new_column_name='dvcs_release')

  # logs has a new column id_project with foreignkey on projects.id
  op.add_column('logs', sa.Column('id_project', sa.Integer, sa.ForeignKey('projects.id')))

  # unique constraint on (projects.hosts, projects.path)
  op.create_unique_constraint('project_unique', 'projects', ['host','path'])

  # create table group
  op.create_table(
     'group',
     sa.Column('id',sa.Integer, primary_key=True),
     sa.Column('label',sa.String(100)),
     sa.Column('creation_date',sa.DateTime)
  )

  # create table user
  op.create_table(
     'user',
     sa.Column('id',sa.Integer, primary_key=True),
     sa.Column('name',sa.String(100)),
     sa.Column('id_group',sa.Integer, sa.ForeignKey('group.id')),
     sa.Column('pwd',sa.String(100)),
     sa.Column('email',sa.String(100), unique=True),
     sa.Column('creation_date',sa.DateTime)
  )

def downgrade():
  """
  """
  # un rename column
  op.alter_column('logs', 'dvcs_release', new_column_name='local_hg_release')

  # remove unique constraint
  op.drop_constraint('project_unique','projects')

  # remove column logs.id_project
  op.drop_column('logs', 'id_project')

  # remove table group
  op.drop_table('group')

  # remove table user 
  op.drop_table('user')
