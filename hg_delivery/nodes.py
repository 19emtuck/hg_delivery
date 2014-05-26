import paramiko
import time

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

    self.ssh = paramiko.SSHClient()
    self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    self.ssh.connect(self.host, username=self.user, password=self.password)

  def check_connection(self):
    """
    """
    pass

class HgNode(NodeSsh):
  """
  """

  def get_current_rev_hash(self):
    """
    """
    stdin, stdout, stderr = self.ssh.exec_command("hg --debug id -i %s"%self.path)
    if stderr == 0 :
       result = []
    result = [l.strip('\n') for l in stdout.readlines()]
    if result : 
      result = result[0]
    else :
      result = None
    return result
  
  def get_last_logs(self, nb_lines):
    stdin, stdout, stderr = self.ssh.exec_command('cd %s ; hg log -l %d --template "{node};{branches};{rev};{parents};{desc};{tags}\n"'%(self.path, nb_lines))
    data = stdout.read()
    list_nodes = []
    while data :
      data = (line.decode('utf-8') for line in data.splitlines())
      node = {}
      for line in data :
        node, branche, rev, parents, desc, tags = line.split(';')
        if not branche : branche = 'default'
        list_nodes.append({'node':node, 'branche':branche, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags})
        node = {}
      data = stdout.read()
    return list_nodes

  def update_to(self, rev):
    """
    update project to a certain release
    :param rev: string, the revision hash
    """
    stdin, stdout, stderr = self.ssh.exec_command('cd %s ; hg update -C -r %s'%(self.path, rev))
    result = True
    if stderr == 0 :
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

    return cls.nodes[uri]


