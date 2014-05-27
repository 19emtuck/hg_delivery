import paramiko
import time
import logging

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

class NodeSsh(object):
  """
  """
  
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

  def get_ssh(self):
    """
      set ssh ...
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(self.host, username=self.user, password=self.password)
    return ssh

  @check_connections
  def run_command(self, command):
    ''' Executes command via SSH. '''

    stdin, stdout, stderr = self.ssh.exec_command(command)
    stdin.flush()
    stdin.channel.shutdown_write()
    ret = stdout.read()
    err = stderr.read()

    if ret:
      if(type(ret)==bytes):
        ret = str(ret,'utf-8')
      return ret
    elif err:
      raise NodeException(err)
    else:
      return None

#------------------------------------------------------------------------------

class HgNode(NodeSsh):
  """
  """

  def get_current_rev_hash(self):
    """
    """
    try :
      data = self.run_command("hg --debug id -i %s"%self.path)
    except NodeException as e :
      result = None
    else :
      result = data.strip('\n')
    return result
  
  def get_last_logs(self, nb_lines, branch_filter=None):
    """
      return last logs ...
      :param nb_lines: integer, limit the number of lines
    """
    try :
      if branch_filter :
        data = self.run_command('cd %s ; hg log -l %d --template "{node}|#|{branches}|#|{rev}|#|{parents}|#|{desc|jsonescape}|#|{tags}\n" -b %s'%(self.path, nb_lines, branch_filter))
      else :
        data = self.run_command('cd %s ; hg log -l %d --template "{node}|#|{branches}|#|{rev}|#|{parents}|#|{desc|jsonescape}|#|{tags}\n"'%(self.path, nb_lines))
    except NodeException as e :
      data = ""

    list_nodes = []

    data = (line for line in data.splitlines())
    node = {}
    for line in data :
      node, branche, rev, parents, desc, tags = line.split('|#|')
      desc = desc.replace('\\n','\n')
      if not branche : branche = 'default'
      list_nodes.append({'node':node, 'branche':branche, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags})
      node = {}
    return list_nodes

  def get_branches(self):
    """
    """
    branches = []
    try :
      data = self.run_command('cd %s ; hg branches\n"'%(self.path))
    except NodeException as e :
      pass
    else :
      branches = sorted((e.split(' ')[0] for e in data.strip().split('\n') if e.split(' ')[0]))

    return branches

  def update_to(self, rev):
    """
    update project to a certain release
    :param rev: string, the revision hash
    """
    result = True
    try :
      data = self.run_command('cd %s ; hg update -C -r %s'%(self.path, rev))
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

  @classmethod
  def get_node(cls, uri):
    """
    """
    if uri not in cls.nodes :
      cls.nodes[uri] = HgNode(uri)

    node = cls.nodes[uri]
    return node

