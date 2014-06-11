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

from pyramid.events import NewResponse, subscriber
from .models import (DBSession, RemoteLog)
from .nodes import NodeSsh

@subscriber(NewResponse)
def log_ssh_commands(event):
  """
  """
  for __command in NodeSsh.logs :
    DBSession.add(RemoteLog(command = __command))
  del NodeSsh.logs[0:]
