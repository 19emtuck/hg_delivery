from pyramid.security import (
    Allow,
    Everyone,
    authenticated_userid,
    )

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

from hg_delivery.nodes import PoolSsh 

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

#------------------------------------------------------------------------------

class Project(Base):
  """
  """
  __tablename__ = 'projects'

  id = Column(Integer, primary_key=True)
  name = Column(String(100))
  user = Column(String(100))
  password = Column(String(100))
  host = Column(String(100))
  path = Column(Text)


  def __json__(self, request):
    """
    """
    return { 'id':self.id,
             'name':self.name,
             'host':self.host,
             'path':self.path,
             'user':self.user,
             'password':self.password}

  def get_uri(self):
    """
    uri as hg way ...
    """
    return "%s:%s@%s:%s"%(self.user, self.password, self.host, self.path)

  def get_ssh_node(self):
    """
    """
    return PoolSsh.get_node(self.get_uri())

#------------------------------------------------------------------------------

Index('project_unique', Project.host, Project.path, unique=True)

class RootFactory(object):
  """
  """
  
  __acl__ = [ (Allow, Everyone, 'view'),
              (Allow, 'group:editors', 'edit') ]

  def __init__(self, request):
    """
    """
    pass

#------------------------------------------------------------------------------
