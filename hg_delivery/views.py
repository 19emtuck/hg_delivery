#!/usr/bin/env python
#
# Copyright (C) 2003-2007  Stéphane Bard <stephane.bard@gmail.com>
#
# This file is part of hg_delivery
#
# hg_delivery is free software; you can redistribute it and/or modify it under the
# terms of the M.I.T License.
#

from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config

from sqlalchemy.exc import DBAPIError, IntegrityError

from .models import (
    DBSession,
    Project,
    )

import paramiko
import time

@view_config(route_name='dashboard', renderer='templates/dashboard.mako')
def dashboard_view(request):
    """
    """
    nodes_description = {}
    lst_projects = DBSession.query(Project).filter(Project.dashboard==1).all()
    for project in lst_projects :
       ssh_node = project.get_ssh_node()
       current_rev = ssh_node.get_current_rev_hash()
       description = ssh_node.get_revision_description(current_rev)
       nodes_description[project.id] = description
    
    return { 'nodes_description':nodes_description,
             'lst_projects':lst_projects }

@view_config(route_name='home', renderer='templates/index.mako')
def default_view(request):
    """
    """
    return {}

@view_config(route_name='project_add', renderer='json', permission='edit')
def add_project(request):
    """
    """
    result = False
    explanation = None

    host = request.params['host']
    path = request.params['path']
    user = request.params['user']
    projects_list =  []

    if not host :
      explanation = u'Your project should contain a valid hostname'
    elif not path :
      explanation = u'Your project should contain a valid path'
    else:
      try :
        # folder should be unique
        project = Project(**request.params)
        DBSession.add(project)
        DBSession.flush()
        projects_list =  DBSession.query(Project).all()
        result = True
        explanation = u'This project : %s@%s/%s has been added ...'%(user, host, path)
      except IntegrityError as e:
        DBSession.rollback()
        result = False
        explanation = u'This project and this path are already defined (%s %s) ...'%(host, path)

    return { 'result':result,
             'projects_list':projects_list,
             'explanation':explanation }

@view_config(route_name='project_update', permission='edit', renderer='json')
def update_project(request):
    """
    """
    result = False
    id_project = request.matchdict['id']

    host = request.params['host']
    path = request.params['path']
    user = request.params['user']
    project = None
    explanation = None
    projects_list = []

    if not host :
      explanation = u'Your project should contain a valid hostname'
    elif not path :
      explanation = u'Your project should contain a valid path'
    else:
      try :
        project =  DBSession.query(Project).get(id_project)
        for key in request.params :
          setattr(project, key, request.params[key])

        if 'dashboard' not in request.params :
          project.dashboard = 0

        DBSession.flush()
        projects_list =  DBSession.query(Project).all()
        explanation = u'This project : %s@%s/%s has been updated ...'%(user, host, path)
        result = True
      except :
        DBSession.rollback()
        result = False

    return { 'result':result,
             'project':project,
             'explanation':explanation,
             'projects_list':projects_list }

@view_config(route_name='project_delete', renderer='json', permission='edit')
def delete_project(request):
    """
    """
    result = False
    try :
      id_project = request.matchdict['id']
      project =  DBSession.query(Project).get(id_project)
      DBSession.delete(project)
      DBSession.flush()
      result = True
    except :
      DBSession.rollback()
      result = False
    return { 'result':result }

@view_config(route_name='project_edit', renderer='edit.mako', permission='edit')
def edit_project(request):
    """
    """
    result = False
    id_project = request.matchdict['id']
    project =  DBSession.query(Project).get(id_project)

    ssh_node = project.get_ssh_node()
    current_rev = ssh_node.get_current_rev_hash()

    branch = None
    if 'branch' in request.params :
      branch = request.params['branch']

    limit = 200
    if 'limit' in request.params:
      #  and request.params['limit'].isigit()
      limit = int(request.params['limit'])

    last_hundred_change_sets, map_change_sets = ssh_node.get_last_logs(limit, branch_filter=branch)
    list_branches = ssh_node.get_branches()
    current_node = ssh_node.get_revision_description(current_rev)

    return { 'project':project,
             'list_branches':list_branches,
             'limit':limit,
             'filter_branch':branch,
             'current_rev':current_rev,
             'current_node':current_node,
             'last_hundred_change_sets':last_hundred_change_sets }

@view_config(route_name='project_change_to', permission='edit')
def update_project_to(request):
  """
  """
  id_project = request.matchdict['id']
  revision = request.matchdict['rev']

  project =  DBSession.query(Project).get(id_project)
  ssh_node = project.get_ssh_node()
  ssh_node.update_to(revision)
  current_rev = ssh_node.get_current_rev_hash()

  while current_rev!=revision :
    # sleep 100 ms
    time.sleep(0.100)
    current_rev = ssh_node.get_current_rev_hash()
  return HTTPFound(location=request.route_url(route_name='project_edit', id=project.id))
