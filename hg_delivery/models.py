#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2003-2007  Stéphane Bard <stephane.bard@gmail.com>
#
# This file is part of hg_delivery
#
# hg_delivery is free software; you can redistribute it and/or modify it under the
# terms of the M.I.T License.
#
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
    DateTime,
    String,
    Boolean
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    )

from zope.sqlalchemy import ZopeTransactionExtension

from .nodes import PoolSsh 

from datetime import datetime

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

#------------------------------------------------------------------------------

class Project(Base):
  """
  The project item
  """
  __tablename__ = 'projects'

  id = Column(Integer, primary_key=True)
  name = Column(String(100))
  user = Column(String(100))
  password = Column(String(100))
  host = Column(String(100))
  path = Column(Text)
  rev_init = Column(String(100))
  dvcs_release = Column(String(20))
  dashboard = Column(Boolean)

  def __init__(self, name, user, password, host, path, rev_init, dashboard, dvcs_release):
    """
    """
    self.name = name
    self.user = user
    self.password = password
    self.host = host 
    self.path = path 
    self.rev_init = rev_init
    self.dashboard = dashboard 
    self.dvcs_release = dvcs_release 

  def __json__(self, request):
    """
    """
    return { 'id':self.id,
             'name':self.name,
             'host':self.host,
             'path':self.path,
             'user':self.user,
             'password':'*'*len(self.password),
             'dashboard':self.dashboard,
             'dvcs_release':self.dvcs_release}

  def get_uri(self):
    """
    uri as hg way ...
    """
    return "%s:%s@%s:%s"%(self.user, self.password, self.host, self.path)

  def get_ssh_node(self):
    """
    """
    return PoolSsh.get_node(self.get_uri())

  def init_initial_revision(self):
    """
    """
    if self.rev_init is None :
      ssh_node = self.get_ssh_node()
      self.rev_init = ssh_node.get_initial_hash()

#------------------------------------------------------------------------------

class RemoteLog(Base):
  """
  This table contains all logs entries
  which command user execute on which host and at what time
  """
  __tablename__ = 'logs'

  id = Column(Integer, primary_key=True)
  host = Column(String(100))
  path = Column(Text)
  command = Column(Text)
  creation_date = Column(DateTime)

  def __init__(self, host, path, command):
    """
    """
    self.creation_date = datetime.now()
    self.host = host
    self.path =path 
    self.command = command

  def __json__(self, request):
    """
    """
    return { 'id':self.id,
             'host':self.host,
             'path':self.path,
             'command':self.command,
             'creation_date':self.creation_date.strftime('%d/%m/%Y %H:%M')}

#------------------------------------------------------------------------------

Index('project_unique', Project.host, Project.path, unique=True)
Index('project_root', Project.rev_init)

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
