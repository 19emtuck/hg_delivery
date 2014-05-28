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
    
    config.add_route('home',           '/')
    config.add_route('login',          '/login')
    config.add_route('logout',         '/logout')
    config.add_route('dashboard',      '/dashboard')
    config.add_route('project_add',    '/project/add')
    config.add_route('project_delete', '/project/delete/{id:\d+}', custom_predicates=(to_int('id'),))
    config.add_route('project_edit',   '/project/edit/{id:\d+}', custom_predicates=(to_int('id'),))
    config.add_route('project_update', '/project/update/{id:\d+}', custom_predicates=(to_int('id'),))
    config.add_route('project_change_to', '/project/change/{id:\d+}/to/{rev}', custom_predicates=(to_int('id'),))

    config.scan()
    return config.make_wsgi_app()
