from sqlalchemy import (
    Column,
    Index,
    Integer,
    Text,
    String,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    )

from zope.sqlalchemy import ZopeTransactionExtension

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

class Project(Base):
  """
  """
  __tablename__ = 'projects'

  id = Column(Integer, primary_key=True)
  name = Column(String(100))
  host = Column(String(100), unique=True)
  path = Column(Text, index=True)


