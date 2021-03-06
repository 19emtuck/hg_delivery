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
import os
import sys

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.rst')) as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt')) as f:
    CHANGES = f.read()

description = ('HgDelivery is an easy way to deliver products  '
               'for Mercurial and Git with a built in push/pull server, '
               'as well as repositories comparison')

classifiers = [
    'Development Status :: 5 - Production/Stable',
    'Environment :: Web Environment',
    'Framework :: Pyramid',
    'Intended Audience :: Developers',
    'License :: OSI Approved :: MIT License',
    'Operating System :: OS Independent',
    'Programming Language :: Python',
    'Programming Language :: Python :: 3.4',
    'Programming Language :: Python :: 3.5',
    'Programming Language :: Python :: 3.6',
    'Topic :: Software Development :: Version Control',
]

if sys.version_info >= (3,6) and sys.version_info < (3,7):
  requires = [
      'pyramid==1.5.1',
      'pyramid_mako==1.0.2',
      'pyramid_tm==1.0.1',
      'SQLAlchemy==1.3.12',
      'transaction==2.0.2',
      'zope.sqlalchemy==0.7.7',
      'waitress==1.4.1',
      'pygments',
      'paramiko==2.7.1',
      'alembic',
      'apscheduler==2.1.2',
      'redis==3.3.11',
      'kombu==4.6.7',
      'pyramid-scheduler==0.3.1',
      ]
elif sys.version_info >= (3,7) :
  requires = [
      'pyramid==1.5.1',
      'pyramid_mako==1.0.2',
      'pyramid_tm==1.0.1',
      'SQLAlchemy==1.3.12',
      'transaction==2.0.2',
      'zope.sqlalchemy==0.7.7',
      'waitress==1.4.1',
      'pygments',
      'paramiko==2.7.1',
      'alembic',
      'apscheduler==2.1.2',
      'redis==3.3.11',
      'kombu==4.6.7',
      'pyramid-scheduler==0.3.1',
      ]
else :
  sys.exit('Sorry, Python < 3.6 is not supported')

setup(name='hg_delivery',
      version='1.0.6',
      description=description,
      long_description=README + '\n\n' + CHANGES,
      classifiers=classifiers,
      author='Stéphane Bard',
      author_email='stephane.bard@gmail.com',
      url='https://bitbucket.org/tuck/hg_delivery',
      keywords='web pyramid hg mercurial git',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='hg_delivery',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = hg_delivery:main
      [console_scripts]
      initialize_hg_delivery_db = hg_delivery.scripts.initializedb:main
      """,
      )
