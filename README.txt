hg_delivery README
==================

A one-click deployment tool written in python with `pyramid <http://www.pylonsproject.org>`_

Global overview
---------------

hg_delivery is a web application who wants to simplify the delivery of small projects and helping people to quickly
revert to a previous stable release if something's wrong. This project targets people bothered by command line, looking
for a nice and simple web interface, able to manage multiple remote repositories. 

inspired from :

  - `like banana project <https://github.com/sniku/Likebanana>`_


features list :

  - add/delete/edit project items

  - projects dashboard

  - display project remote summarize (last commit, current revision ...)

  - display the state of repository

  - update to a specific revision for remote repository

  - repositories compare

  - pushing or pulling on a remote repository


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



