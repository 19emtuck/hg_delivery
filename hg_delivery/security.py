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
from pyramid.security import remember, forget

USERS = {'editor': 'editor',
         'viewer': 'viewer'}

GROUPS = {'editor': ['group:editors']}

def groupfinder(userid, request):
  result = None

  if userid in USERS:
      result = GROUPS.get(userid, [])

  # whatever every body is an editor
  return ['group:editors']

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

    if login and password and USERS.get(login) == password:
        headers = remember(request, login)
        return HTTPFound( location= came_from,
                          headers = headers )
    message = 'Failed login'

  return HTTPFound(location=request.route_url('home'))

@view_config(route_name='logout')
def logout(request):
  headers = forget(request)
  url = request.route_url('home')

  return HTTPFound( location= url,
                    headers = headers )
