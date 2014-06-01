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

def to_int(*segment_names):
  def predicate(info, request):
      match = info['match']
      for segment_name in segment_names:
          try:
              match[segment_name] = int(match[segment_name])
          except (TypeError, ValueError):
              pass
      return True
  return predicate
