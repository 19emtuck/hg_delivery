#!/bin/sh
if [ -f /usr/bin/hg ]; then
  /usr/bin/hg $@
fi
if [ -f /usr/local/bin/hg ]; then
  /usr/local/bin/hg $@
fi
