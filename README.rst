hg_delivery README
==================

A one-click deployment tool written in python with `pyramid <http://www.pylonsproject.org>`_ web framework

**current release : v_0_9**

Global overview
---------------

hg_delivery is a web application who aims to simplify the delivery of small projects and helping people to quickly
revert to a previous stable release if something's wrong. This project targets people bothered by command line, looking
for a nice and simple web interface, able to manage multiple remote repositories. 

inspired from :

  - `like banana project <https://github.com/sniku/Likebanana>`_


features list :

  - remote repository access *ssh only*

  - add/delete/edit project items

  - clip project on dashboard

  - display remote project summarize (last commit, current revision ...)

  - display the state of repository

  - update to a specific revision for remote repository

  - one/one repository compare

  - pushing or pulling on/from a remote repository

  - add additional task when updating a repository (*useful for flushing the cache* or *for gracefull apache*)

  - responsive design (thanks to bootstrap)

  - a scheduler is available to close ssh pool connection if none are used, it leaves clean connections, *thx to pyramid-scheduler*

  - a diff viewer or merge style *thx to mergely* 

  - you can also create macros, and create in one single button a simple way to push to all. That way
    you can push to all acceptance platform or simply push all your commits to all your nodes.

  - some project may be removed from scope automation. This can be defined in project configuration 
    (useful if some nodes are declared but stage as draft)

Made for what ?
---------------

hg_delivery has been designed to simplify developper daily work.

 - If you developp php application, this can be useful to deliver your project (no reload expected)

 - In fact any other webapps made with other languages is suitable too.

 - If you need fine grain delivery and or immediate rollback

 - If you whish to manage external repository and change branch one a click

Licensing
---------

Copyright (C) 2014  Stéphane Bard <stephane.bard@gmail.com>

hg_delivery is free software; you can redistribute it and/or modify it under the terms of the M.I.T License. The
original author name should always be reminded as the original author.

Getting Started
---------------

.. code-bloc::bash

    hg clone https://bitbucket.org/tuck/hg_delivery
    cd hg_delivery
    $VENV/bin/python setup.py develop
    $VENV/bin/initialize_hg_delivery_db development.ini
    $VENV/bin/pserve development.ini

.. note:: please use production.ini file for production purpose :)

Sample usage
------------

.. image:: documentation/repoistories_illustration.jpg


Changelog
---------

  - v_0_1 :

    - first True release

    - known bug : cannot push/pull with another password than current node

  - v_0_2 :

    - casperjs use

    - known bug : cannot push/pull with another password than current node

  - v_0_3 :

    - fix bug with node password when push or pull

  - v_0_4 :

    - bug and typo fixes

  - v_0_5 :

    - add task feature with acl control

  - v_0_7 :

    - reuse logs to display delivery date

    - pypi delivery

  - v_0_8 :

    - add thread to handle multiple push or update in a single request

    - various bugfixes

  - v_0_9 :

    - macros system (raw way to define them)

    - user can also filter repository he didn't want to scan

    - administrator may finely define ACL per user

    - logs will now inherit from user and give better precision

    - mercurial 3.8 template syntax fix (jsonescape vs json)

    - bugfix : ACL might be uncorrectly used on previous release

    - test evolve as usual

    - add an sql_log_change.txt file to explain change from 0.8 to 0.9 (don't have any better mecanism actually
      (comparing models.py version could be a good start))
