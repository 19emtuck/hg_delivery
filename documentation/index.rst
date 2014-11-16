starting
^^^^^^^^

- download it

- install package :

  .. code-block:: bash

    python setup.py develop

- modify ``development.ini`` or ``production.ini`` especially default login and password

  development.ini or production.ini :
 
  .. code-block:: ini

    hg_delivery.default_login = ******
    hg_delivery.default_pwd = ******

- call init database :

  .. code-block:: python

    initialize_hg_delivery_db development.ini

  or as well :

  .. code-block:: python

    initialize_hg_delivery_db production.ini

