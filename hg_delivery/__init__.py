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
from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from hg_delivery.security import groupfinder
from hg_delivery.predicates import to_int 

from .models import (
  DBSession,
  Base,
  )

def projects_include(config):
  """
    Add all routes about project management
    (crud way ...)
  """
  config.add_route('project_add',           '/add')
  config.add_route('project_delete',        '/delete/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_edit',          '/edit/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_fetch',         '/fetch/{id:\d+}', custom_predicates=(to_int('id'),))
  config.add_route('project_revision_details_json', '/detail/json/{id:\d+}/revision/{rev}', custom_predicates=(to_int('id'),))
  config.add_route('project_revision_details',      '/detail/{id:\d+}/revision/{rev}', custom_predicates=(to_int('id'),))
  config.add_route('project_update',        '/update/{id:\d+}', custom_predicates=(to_int('id'),))

  # move project to another revision
  config.add_route('project_change_to',     '/change/{id:\d+}/to/{rev}', custom_predicates=(to_int('id'),))

  # provide difference between two revision
  config.add_route('project_revisions_diff', '/{id:\d+}/diff', custom_predicates=(to_int('id'),))

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

  config = Configurator(settings=settings,
                        root_factory='hg_delivery.models.RootFactory')

  config.set_authentication_policy(authn_policy)
  config.set_authorization_policy(authz_policy)

  # config.add_static_view('static', 'static', cache_max_age=3600)
  config.add_static_view('static', 'static')
  
  config.add_route('home',         '/')
  config.add_route('login',        '/login')
  config.add_route('logout',       '/logout')

  config.include(projects_include, '/project')

  config.scan()
  return config.make_wsgi_app()
