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

import paramiko
import time
import logging
import socket
import threading
import re
import os.path
import logging

from pygments import highlight
from pygments.lexers import DiffLexer
from pygments.formatters import HtmlFormatter
from pygments.styles import get_all_styles 
styles = list(get_all_styles())

log = logging.getLogger(__name__)

#------------------------------------------------------------------------------

class NodeException(Exception):
  """
  """

#------------------------------------------------------------------------------

def check_connections(function):
  """
    A decorator to check SSH connections.
  """

  def deco(self, *args, **kwargs):
      if self.ssh is None:
          self.ssh = self.get_ssh()
      else:
          ret = getattr(self.ssh.get_transport(), 'is_active', None)
          if ret is None or (ret is not None and not ret()):
              self.ssh = self.get_ssh()
      return function(self, *args, **kwargs)
  return deco

#------------------------------------------------------------------------------

class DiffWrapper(object):
  """
  """

  def __init__(self, raw_diff):
    """
    """
    self.raw_diff = raw_diff

    self.lst_files = []
    self.dict_files = []
    self.lst_basename_files = []

    if self.raw_diff :
      # we init content ...
      self.lst_files = self.__get_lst_files()
      self.lst_basename_files = [os.path.basename(f_name) for f_name in self.lst_files]
      self.dict_files = self.__get_files_to_diff()

  def __get_lst_files(self):
    """
    """
    groups = re.findall("diff -r [a-z0-9]+ (?P<file_name>.+)$",self.raw_diff, re.MULTILINE) 
    return groups

  def __get_files_to_diff(self):
    """
    """
    groups = self.__get_lst_files()
    diffs_content = [highlight(bloc, DiffLexer(), HtmlFormatter(cssclass='source', style='colorful')) for bloc in re.split("\n*diff -r [a-z0-9]{8,20} [^\n]+\n",self.raw_diff) if bloc.strip()]
    return dict(zip(groups, diffs_content))

  def __json__(self, request):
    """
    """
    return { 'id':self.raw_diff,
             'lst_files':self.lst_files,
             'lst_basename_files':self.lst_basename_files,
             'dict_files':self.dict_files
           }


#------------------------------------------------------------------------------

class NodeSsh(object):
  """
  """

  logs = []
  
  def __init__(self, uri):
    """
      uri should like this 

      "{user}:{password}@{host}:{path}"
    """
    self.uri = uri
    user,password_host,path = uri.split(':')

    self.user = user
    self.path = path 
    self.password, self.host = password_host.split('@')

    self.ssh = self.get_ssh()
    self.lock = threading.Lock()
    self.state_locked = False

  def decode_raw_bytes(self, bytes_content):
    """
    """
    content = ""

    for codec in ('latin-1','utf-8') :
      try :
        content = str(bytes_content, codec)
      except :
        content = ""
      else :
        break

    return content

  def get_ssh(self):
    """
      set ssh ...
    """
    try :
      ssh = paramiko.SSHClient()
      ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
      ssh.connect(self.host, username=self.user, password=self.password)
    except socket.gaierror :
      raise NodeException("host unavailable")
    return ssh

  @check_connections
  def run_command_and_feed_password_prompt(self, command, password, reg_password ='password: ', reg_shell = '[^\n\r]+@[^\n\r]+\$'):
    '''
      Execute command through SSH and also feed prompt !
    '''
    full_log = []
    with self.lock :

      self.state_locked = True
      channel = self.ssh.invoke_shell()

      # We received a potential prompt.
      # something like toto@hostname:~$
      buff = ''
      t0 = time.time()
      time_out = False
      full_log.append('org_command %s'%command)

      wait_time = 0.05
      while len(re.findall(reg_shell, buff, re.MULTILINE))==0:
          resp = channel.recv(9999)
          buff += self.decode_raw_bytes(resp)

          time.sleep(wait_time)
          wait_time += 0.05

          if time.time() - t0 > 60 :
            time_out = True
            break
      full_log.append('buff1 %s'%buff)

      if not time_out :
        # ssh and wait for the password prompt.
        channel.send(command + '\n')

        buff = ''
        t0 = time.time()
        wait_time = 0.05
        while not buff.endswith(reg_password):
            resp = channel.recv(9999)
            buff += self.decode_raw_bytes(resp)

            time.sleep(wait_time)
            wait_time += 0.05

            if time.time()-t0 > 60 :
              time_out = True
              break
        full_log.append('buff2 %s'%buff)

      if not time_out :
        # Send the password and wait for a prompt.
        channel.send(self.password + '\n')
 
        buff = ''
        t0 = time.time()
        # wait : 'added 99 changesets with 243 changes to 27 files'
        # wait : "(run 'hg update' to get a working copy)"
        # 
        # sample pushing ...
        # 
        # searching for changes
        # remote: adding changesets
        # remote: adding manifests
        # remote: adding file changes
        # remote: added 90 changesets with 102 changes to 68 files
        wait_time = 0.05
        while buff.find('to get a working copy') < 0 and buff.find('changesets with') < 0 and buff.find("abort: push creates new remote branches") < 0 and len(re.findall(reg_shell, buff, re.MULTILINE))==0:
            resp = channel.recv(9999)
            buff += self.decode_raw_bytes(resp)
            time.sleep(wait_time)
            wait_time += 0.05
            if time.time() - t0 > 60 :
              time_out = True
              break

        full_log.append('buff2 %s'%buff)
        ret=buff

    self.state_locked = False

    self.__class__.logs.append((self.host, self.path, re.sub("^cd[^;]*;",'',command)))

    return {'out':    [], 
            'err':    [],
            'retval': []}

  @check_connections
  def run_command(self, command, log=False):
    ''' Executes command via SSH. '''
    # we lock threads per resource
    with self.lock :
      try :
        stdin, stdout, stderr = self.ssh.exec_command(command)
        stdin.flush()
        stdin.channel.shutdown_write()
        ret = stdout.read()
        err = stderr.read()

        if err:
          raise NodeException(err)
        elif ret:

          if log :
            self.__class__.logs.append((self.host, self.path, re.sub("^cd[^;]*;",'',command)))

          if(type(ret)==bytes):
            ret = self.decode_raw_bytes(ret)
          return ret
        else:
          return None

      except socket.gaierror :
        raise NodeException("host unavailable")

#------------------------------------------------------------------------------

class HgNode(NodeSsh):
  """
    Some node to manipulate remote hg repository 
  """

  _template = "{node}|#|{author}|#|{branches}|#|{rev}|#|{parents}|#|{desc|jsonescape}|#|{tags}\n" 


  def compare_release_a_sup_equal_b(self, release_a, release_b):
    """
    """
    tab_a = [int(e) for e in release_a.split('.')]
    tab_b = [int(e) for e in release_b.split('.')]

    result = False

    for i in range(len(tab_a)) :
      ele_a = tab_a[i]

      if len(tab_b) >= i+1 :
        ele_b = tab_b[i]
      else :
        ele_b = 0

      if (ele_a > ele_b) :
        result = True
        break
      elif (ele_a < ele_b) :
        result = False
        break

    return result

  def get_hg_release(self):
    """
    """
    try :
      data = self.run_command("cd %s ; hg --version"%self.path)
      data = re.findall('\((?:version) (?P<version>[0-9\.]+)\)',data)
      if data : 
        data = data[0]
      else :
        data = None
    except Exception as e:
      data = None
    return data

  def get_current_rev_hash(self):
    """
    """
    try :
      data = self.run_command("cd %s ; hg --debug id -i"%self.path)
    except NodeException as e :
      result = None
    else :
      # hg may add '+' to indicate tip release
      # '+' is not part of changeset hash
      result = data.strip('\n').split(' ')[0].strip('+')
    return result

  def push_to(self, local_project, target_project):
    """
    """
    if local_project.local_hg_release is None :
      local_project.local_hg_release = self.get_hg_release()

    if (local_project.local_hg_release is not None and self.compare_release_a_sup_equal_b(local_project.local_hg_release, '1.7.4')) :
      insecure = " --insecure "
    else:
      insecure = " "

    data = self.run_command_and_feed_password_prompt('cd %s ; hg push%sssh://%s@%s/%s'%(
                                                        self.path,
                                                        insecure,
                                                        target_project.user,
                                                        target_project.host,
                                                        target_project.path),
                                                        target_project.password)

  def pull_from(self, local_project, source_project):
    """
    """
    if local_project.local_hg_release is None :
      local_project.local_hg_release = self.get_hg_release()

    if (local_project.local_hg_release is not None and self.compare_release_a_sup_equal_b(local_project.local_hg_release, '1.7.4')) :
      insecure = " --insecure "
    else:
      insecure = " "
    data = self.run_command_and_feed_password_prompt('cd %s ; hg pull%sssh://%s@%s/%s'%(self.path,
                                                            insecure,
                                                            source_project.user,
                                                            source_project.host,
                                                            source_project.path),
                                                            source_project.password)

  def get_last_logs(self, nb_lines, branch_filter=None, revision_filter=None):
    """
      return last logs ...
      :param nb_lines: integer, limit the number of lines
    """
    try :
      if revision_filter :
        data = self.run_command('cd %s ; hg log --template "%s" -r %s'%(self.path, self._template, revision_filter))
      elif branch_filter :
        data = self.run_command('cd %s ; hg log -l %d --template "%s" -b %s'%(self.path, nb_lines, self._template, branch_filter))
      else :
        data = self.run_command('cd %s ; hg log -l %d --template "%s"'%(self.path, nb_lines, self._template))
    except NodeException as e :
      data = ""

    list_nodes = []
    map_nodes = {}

    data = (line for line in data.splitlines())
    node = {}

    for line in data :
      node, author, branch, rev, parents, desc, tags = line.split('|#|')
      desc = desc.replace('\\n','\n')
      if not branch : branch = 'default'
      list_nodes.append({'node':node, 'branch':branch, 'author':author, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags})
      map_nodes[node]=list_nodes[-1]

    return list_nodes, map_nodes

  def get_file_content(self, file_name, revision):
    """
    """
    try :
      result = self.run_command("cd %s ; hg cat %s -r %s"%(self.path, file_name, revision))
    except NodeException as e :
      result = None
    return result
    
  def get_initial_hash(self):
    """
      return the initial hash (revision 0)
      :return: string hash
    """
    try :
      data = self.run_command("cd %s ; hg --debug id -i -r 0"%self.path)
    except NodeException as e :
      result = None
    else :
      # hg may add '+' to indicate tip release
      # '+' is not part of changeset hash
      result = data.strip('\n').split(' ')[0].strip('+')
    return result
     

  def get_branches(self):
    """
      return a list of branches labels
    """
    branches = []
    try :
      data = self.run_command('cd %s ; hg branches'%(self.path))
    except NodeException as e :
      pass
    else :
      branches = sorted((e.split(' ')[0] for e in data.strip().split('\n') if e.split(' ')[0]))

    return branches

  def get_current_revision_description(self):
    """
    """
    node = {}
    try :
      data = self.run_command('''cd %s ; hg --debug id | cut -d' ' -f 1 | tr -d ' +' | xargs -I {} hg log -r {} --template "%s"'''%(self.path, self._template))
    except NodeException as e :
      node = {}
    else :
      node, author, branch, rev, parents, desc, tags = data.split('|#|')
      desc = desc.replace('\\n','\n')
      if not branch : branch = 'default'
      node = {'node':node, 'branch':branch, 'author':author, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags}
    return node 

  def get_revision_diff(self, revision):
    """
    :param revision: the revision hash
    """
    diff_content = ""
    try :
      diff_content = self.run_command('''cd %s ; hg diff -c %s'''%(self.path, revision))
    except NodeException as e :
      diff_content = "" 
    return DiffWrapper(diff_content)

  def get_revision_description(self, rev):
    """
    """
    list_nodes, map_nodes = self.get_last_logs(1, revision_filter=rev)
    first_node = {}
    if list_nodes :
      first_node = list_nodes[0]
    return first_node

  def update_to(self, rev):
    """
    update project to a certain release
    :param rev: string, the revision hash
    """
    result = True
    try :
      data = self.run_command('cd %s ; hg update -C -r %s'%(self.path, rev), True)
    except NodeException as e :
      result = False
    return result

#------------------------------------------------------------------------------

class PoolSsh(object):
  """
  pool of ssh connection to maintain, recycle
  check and so on ...
  """

  nodes = {}
  max_nodes_in_pool = 10

  @classmethod
  def get_node(cls, uri):
    """
    try to acquire a free ssh channel or open a new one ...
    """
    node = None

    if uri not in cls.nodes :
      cls.nodes[uri] = [HgNode(uri)]
      node = cls.nodes[uri][0]
    else :
      for __node in cls.nodes[uri] :
        if not __node.state_locked :
          node = __node
          break

      if node is None and len(cls.nodes[uri]) < cls.max_nodes_in_pool :
        log.warning("creating additional node in pool (%s)"%(len(cls.nodes[uri])))
        node = HgNode(uri)
        cls.nodes[uri].append(node)
      elif node is None :
        log.warning("creating extra node (%s)"%(len(cls.nodes[uri])))
        # we create a new node to avoid flooding which will be
        # garbage collected at the end of request
        # this is slower but max nodes should represent a correct usage
        node = HgNode(uri)

    return node

