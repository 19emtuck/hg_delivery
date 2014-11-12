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
from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from hg_delivery.security import groupfinder, GROUPS, DEFAULT_USER
from hg_delivery.predicates import to_int 

from .models import (
  DBSession,
  Base,
  )

#------------------------------------------------------------------------------

def projects_include(config):
  """
    Add all routes about project management
    (crud way ...)
  """
  config.add_route('project_add',                     '/add')
  config.add_route('project_delete',                  '/delete/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_edit',                    '/edit/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_fetch',                   '/fetch/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_revision_details_json',   '/detail/json/{id:\d+}/revision/{rev}', custom_predicates=(to_int('id'),))
  config.add_route('project_revision_details',        '/detail/{id:\d+}/revision/{rev}', custom_predicates=(to_int('id'),))
  config.add_route('project_update',                  '/update/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_mark',                    '/mark/{id:\d+}/{hash}/{mark_id}', custom_predicates=(to_int('id'),to_int('mark_id'),))

  # push/pull from another project 
  config.add_route('project_pull_from',               '/pull/{id:\d+}/from/{source:\d+}', custom_predicates=(to_int('id'),to_int('source'),))
  config.add_route('project_push_to',                 '/push/{id:\d+}/to/{target:\d+}', custom_predicates=(to_int('id'),to_int('target'),))

  # move project to another revision
  config.add_route('project_change_to',               '/change/{id:\d+}/to/{rev}', custom_predicates=(to_int('id'),))

  config.add_route('project_logs',                    '/logs/{id:\d+}', custom_predicates=(to_int('id'),))

  # provide difference between two revision
  config.add_route('project_revisions_diff',          '/{id:\d+}/diff', custom_predicates=(to_int('id'),))

#------------------------------------------------------------------------------

def users_include(config):
  """
    Users routes definitions
  """
  config.add_route('users',        '/view')
  config.add_route('users_json',   '/json')
  config.add_route('user_add',     '/add')
  config.add_route('user_delete',  '/{id:\d+}/delete')
  config.add_route('user_update',  '/{id:\d+}/update')
  config.add_route('user_get',     '/{id:\d+}/get')

#------------------------------------------------------------------------------

def main(global_config, **settings):
  """ This function returns a Pyramid WSGI application.
  """
  engine = engine_from_config(settings, 'sqlalchemy.')
  DBSession.configure(bind=engine)
  Base.metadata.bind = engine
  config = Configurator(settings=settings)
  
  # Security policies
  authn_policy = AuthTktAuthenticationPolicy(
      settings['hg_delivery.secret'], callback=groupfinder,
      hashalg='sha512')
  authz_policy = ACLAuthorizationPolicy()


  if 'hg_delivery.default_login' in settings :
    __login = settings['hg_delivery.default_login']
    __pwd   = settings['hg_delivery.default_pwd']

    GROUPS[__login] = 'group:editors'
    DEFAULT_USER[__login] = __pwd

  config = Configurator(settings=settings,
                        root_factory='hg_delivery.models.RootFactory')

  config.set_authentication_policy(authn_policy)
  config.set_authorization_policy(authz_policy)

  # config.add_static_view('static', 'static', cache_max_age=3600)
  config.add_static_view('static', 'static')
  
  config.add_route('home',         '/')
  config.add_route('login',        '/login')
  config.add_route('logout',       '/logout')
  config.add_route('logs',         '/logs')
  config.add_route('contact',      '/contact')

  config.include(projects_include, '/project')
  config.include(users_include,    '/users')

  config.scan()
  return config.make_wsgi_app()
