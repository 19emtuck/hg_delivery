#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2014  Stéphane Bard <stephane.bard@gmail.com>
#
# This file is part of hg_delivery
#
# hg_delivery is free software; you can redistribute it and/or modify it under the
# terms of the M.I.T License.
#
from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config
from pyramid.security import remember, forget, Allow, Everyone, Authenticated, authenticated_userid

from .models import (
    User,
    Acl, 
    Group,
    DBSession,
    Project,
    )

GROUPS = {'editor': ['group:editors']}
DEFAULT_USER = {}

#------------------------------------------------------------------------------

def get_users():
  """
    return all known users from database
  """
  db_result = {email:password for (email,password) in DBSession.query(User.email,User.pwd)}
  # add default user
  db_result.update(DEFAULT_USER)
  return db_result

#------------------------------------------------------------------------------

def groupfinder(userid, request):
  result = None

  if userid in get_users() :
    result = GROUPS.get(userid, ['group:editors'])

  # whatever every body is an editor
  return ['group:editors']

#------------------------------------------------------------------------------

class ProjectFactory(object):
    __acl__ = []

    def __init__(self, request):
      self.request = request

      # because of predicates id should be an int ...
      id_project = request.matchdict[u'id']
      id_user = request.authenticated_userid

      self.__acl__ = []

      if request.registry.settings['hg_delivery.default_login'] == id_user :
        self.__acl__ = [(Allow, Authenticated, 'edit')]
      else :
       for _label_acl in DBSession.query(Acl.acl).join(User).filter(Acl.id_project==id_project).filter(User.email==id_user) :
         self.__acl__.append((Allow, Authenticated, _label_acl))

#------------------------------------------------------------------------------

@view_config(route_name='login')
def login(request):
  login_url = request.route_url('login')
  referrer = request.url

  if referrer == login_url:
      referrer = '/'  # never use login form itself as came_from

  came_from = request.params.get('came_from', referrer)
  message = ''
  login = ''
  password = ''

  if 'login' in request.params and 'password' in request.params :
    login = request.params['login']
    password = request.params['password']
    all_known_users =  get_users()
    if login and password and all_known_users.get(login) == password:
        headers = remember(request, login)
        return HTTPFound( location= came_from,
                          headers = headers )
    message = 'Failed login'

  return HTTPFound(location=request.route_url('home'))

#------------------------------------------------------------------------------

@view_config(route_name='logout')
def logout(request):
  headers = forget(request)
  url = request.route_url('home')

  return HTTPFound( location= url,
                    headers = headers )
