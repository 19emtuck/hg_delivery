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
import os
import sys
import transaction

from sqlalchemy import engine_from_config

from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from pyramid.scripts.common import parse_vars

from ..models import (
    DBSession,
    Project,
    Base,
    )


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> [var=value]\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) < 2:
        usage(argv)
    config_uri = argv[1]
    options = parse_vars(argv[2:])
    setup_logging(config_uri)
    settings = get_appsettings(config_uri, options=options)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    with transaction.manager:
        project = Project(name='t1', user='sbard', password='evangelion', host='127.0.0.1', path='/home/sbard/dev/t1/', rev_init=None, dashboard=1, local_hg_release=None)
        DBSession.add(project)
        project = Project(name='t2', user='sbard', password='evangelion', host='127.0.0.1', path='/home/sbard/dev/t2/', rev_init=None, dashboard=1, local_hg_release=None)
        DBSession.add(project)
        project = Project(name='t3', user='sbard', password='evangelion', host='127.0.0.1', path='/home/sbard/dev/t3/', rev_init=None, dashboard=1, local_hg_release=None)
        DBSession.add(project)
        project = Project(name='hg_delivery', user='sbard', password='evangelion', host='127.0.0.1', path='/home/sbard/dev/hg_delivery/', rev_init=None, dashboard=1, local_hg_release=None)
        DBSession.add(project)
