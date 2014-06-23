#!/usr/bin/env python
#
# Copyright (C) 2003-2007  Stéphane Bard <stephane.bard@gmail.com>
#
# This file is part of hg_delivery
#
# hg_delivery is free software; you can redistribute it and/or modify it under the
# terms of the M.I.T License.
#

from pyramid.events import (
     NewRequest,
     NewResponse,
     BeforeRender,
     subscriber
     )

from .models import (
    DBSession,
    Project,
    RemoteLog
    )

from .nodes import NodeSsh

@subscriber(BeforeRender)
def mysubscriber(event):
  request = event['request']

  event['url'] = request.route_url
  event['static_url'] = request.static_url
  event['logged_in'] = request.authenticated_userid

  # log data and flush them into database
  if NodeSsh.logs :
    for (__host, __path, __command) in NodeSsh.logs :
      DBSession.add(RemoteLog(host = __host, path = __path, command = __command))
    del NodeSsh.logs[0:]



