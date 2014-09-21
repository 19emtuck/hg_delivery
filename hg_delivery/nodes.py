# Copyright (C) 2014  Stéphane Bard <stephane.bard@gmail.com>
import os.path
import logging
import uuid
import sys

from pygments import highlight
from pygments.lexers import DiffLexer
from pygments.formatters import HtmlFormatter
from pygments.styles import get_all_styles

styles = list(get_all_styles())

log = logging.getLogger(__name__)

#------------------------------------------------------------------------------

if sys.version < '3':
    def u(x, codec):
        return x.decode(codec)
else:
    def u(x, codec):
        return str(x, codec)

    self.lst_files = []
    self.dict_files = []
    self.lst_basename_files = []

      # we init content ...
      self.lst_basename_files = [os.path.basename(f_name) for f_name in self.lst_files]
    groups = re.findall(u"diff -r [a-z0-9]+ (?P<file_name>.+)$",self.raw_diff, re.MULTILINE)
    diffs_content = [highlight(bloc, DiffLexer(), HtmlFormatter(cssclass=u'source', style=u'colorful')) for bloc in re.split(u"\n*diff -r [a-z0-9]{8,20} [^\n]+\n",self.raw_diff) if bloc.strip()]
  def __json__(self, request):
    """
    """
    return { u'id':self.raw_diff,
             u'lst_files':self.lst_files,
             u'lst_basename_files':self.lst_basename_files,
             u'dict_files':self.dict_files
           }


  max_timeout = 60*5
  def __init__(self, uri, project_id):
      uri should like this
    self.project_id = project_id
    user,password_host,path = uri.split(u':')
    self.path = path
    self.password, self.host = password_host.split(u'@')
    self.state_locked = False

  def decode_raw_bytes(self, bytes_content):
    """
    """
    content = ""
    for codec in (u'latin-1', u'utf-8') :
      try :
        content = u(bytes_content, codec)
      except Exception as e:
        content = ""
      else :
        break
    return content
      raise NodeException(u"host unavailable")
  @check_connections
  def run_command_and_feed_password_prompt(self, command, password, reg_password ='password: ', reg_shell = '[^\n\r]+@[^\n\r]+\$'):
    '''
      Execute command through SSH and also feed prompt !
    '''
    guid = uuid.uuid1().hex

    # add a foot print as a guid
    # so we are sure
    command += u";echo '%s'"%guid

    full_log = []
    with self.lock :

      self.state_locked = True
      channel = self.ssh.invoke_shell()
      channel.settimeout(self.__class__.max_timeout)

      # We received a potential prompt.
      # something like toto@hostname:~$
      buff = ''
      t0 = time.time()
      time_out = False
      full_log.append(u'org_command %s'%command)

      wait_time = 0.05
      while len(re.findall(reg_shell, buff, re.MULTILINE))==0:
          resp = channel.recv(9999)
          buff += self.decode_raw_bytes(resp)

          time.sleep(wait_time)
          wait_time += 0.05

          if time.time() - t0 > 60 :
            time_out = True
            break
      full_log.append(u'buff1 %s'%buff)

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
        full_log.append(u'buff2 %s'%buff)

      if not time_out :
        # Send the password and wait for a prompt.
        channel.send(self.password + '\n')
 
        buff = u''
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
        while buff.find(u'to get a working copy') < 0 and buff.find(u'changesets with') < 0 and buff.find(u"abort: push creates new remote branches") < 0 and len(re.findall(reg_shell, buff, re.MULTILINE))==0 and buff.find(guid)<0:
            resp = channel.recv(9999)
            buff += self.decode_raw_bytes(resp)
            time.sleep(wait_time)
            wait_time += 0.05
            if time.time() - t0 > 60 :
              time_out = True
              break

        full_log.append(u'buff2 %s'%buff)
        ret=buff

    self.state_locked = False

    self.__class__.logs.append((self.project_id, self.host, self.path, re.sub(u"^cd[^;]*;",'',command)))

    return {u'out':    [],
            u'err':    [],
            u'retval': []}


            self.__class__.logs.append((self.project_id, self.host, self.path, re.sub(u"^cd[^;]*;",'',command)))
            ret = self.decode_raw_bytes(ret)
        raise NodeException(u"host unavailable")

  def compare_release_a_sup_equal_b(self, release_a, release_b):
    """
    """
    tab_a = [int(e) for e in release_a.split(u'.')]
    tab_b = [int(e) for e in release_b.split(u'.')]

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
    Some node to manipulate remote hg repository
  _template = u"{node}|#|{author}|#|{branches}|#|{rev}|#|{parents}|#|{desc|jsonescape}|#|{tags}\n" 

  def get_release(self):
    """
    """
    try :
      data = self.run_command(u"cd %s ; hg --version"%self.path)
      data = re.findall(u'\((?:version) (?P<version>[0-9\.]+)\)',data)
      if data : 
        data = data[0]
      else :
        data = None
    except Exception as e:
      data = None
    return data
      data = self.run_command(u"cd %s ; hg --debug id -i"%self.path)
      result = data.strip(u'\n').split(u' ')[0].strip(u'+')

  def push_to(self, local_project, target_project):
    """
    """
    if not local_project.dvcs_release :
      local_project.dvcs_release = self.get_release()

    if (local_project.dvcs_release is not None and self.compare_release_a_sup_equal_b(local_project.dvcs_release, '1.7.4')) :
      insecure = u" --insecure "
    else:
      insecure = u" "

    data = self.run_command_and_feed_password_prompt(u'cd %s ; hg push%sssh://%s@%s/%s'%(
                                                        self.path,
                                                        insecure,
                                                        target_project.user,
                                                        target_project.host,
                                                        target_project.path),
                                                        target_project.password)

  def pull_from(self, local_project, source_project):
    """
    """
    if not local_project.dvcs_release :
      local_project.dvcs_release = self.get_release()

    if (local_project.dvcs_release is not None and self.compare_release_a_sup_equal_b(local_project.dvcs_release, '1.7.4')) :
      insecure = " --insecure "
    else:
      insecure = " "
    data = self.run_command_and_feed_password_prompt(u'cd %s ; hg pull%sssh://%s@%s/%s'%(self.path,
                                                            insecure,
                                                            source_project.user,
                                                            source_project.host,
                                                            source_project.path),
                                                            source_project.password)

        data = self.run_command(u'cd %s ; hg log --template "%s" -r %s'%(self.path, self._template, revision_filter))
        data = self.run_command(u'cd %s ; hg log -l %d --template "%s" -b %s'%(self.path, nb_lines, self._template, branch_filter))
        data = self.run_command(u'cd %s ; hg log -l %d --template "%s"'%(self.path, nb_lines, self._template))
      node, author, branch, rev, parents, desc, tags = line.split(u'|#|')
      desc = desc.replace(u'\\n','\n')
      result = self.run_command(u"cd %s ; hg cat %s -r %s"%(self.path, file_name, revision))
      data = self.run_command(u"cd %s ; hg --debug id -i -r 0"%self.path)
      result = data.strip(u'\n').split(u' ')[0].strip(u'+')
      data = self.run_command(u'cd %s ; hg branches'%(self.path))
      branches = sorted((e.split(u' ')[0] for e in data.strip().split(u'\n') if e.split(u' ')[0]))
      data = self.run_command(u'''cd %s ; hg --debug id | cut -d' ' -f 1 | tr -d ' +' | xargs -I {} hg log -r {} --template "%s"'''%(self.path, self._template))
      node, author, branch, rev, parents, desc, tags = data.split(u'|#|')
      desc = desc.replace(u'\\n','\n')
      diff_content = self.run_command(u'''cd %s ; hg diff -c %s'''%(self.path, revision))
  def get_revision_description(self, rev):
      data = self.run_command(u'cd %s ; hg update -C -r %s'%(self.path, rev), True)
    except NodeException as e :
      result = False
    return result

#------------------------------------------------------------------------------

class GitNode(NodeSsh):
  """
    A specific node to manipulate remote git repository 
  """

  _template = u"%H|#|%cn|#|{branches}|#|{rev}|#|%P|#|{desc|jsonescape}|#|{tags}\n"

  def get_release(self):
    """
    """
    try :
      data = self.run_command(u"cd %s ; git --version --no-color"%self.path)
      data = re.findall(u'(?:version) (?P<version>[0-9\.]+)', data)
      if data : 
        data = data[0]
      else :
        data = None
    except Exception as e:    
      data = None             
    return data

  def get_current_rev_hash(self):
    """
      commit 1ea7f6aa3feef3e257e3fe4fde6b6994983c6062
      Author: sbard <toto.free.fr>
      Date:   Wed Sep 10 10:10:27 2014 +0200
      
          fix test
      
      diff --git a/toto.txt b/toto.txt
      new file mode 100644
      index 0000000..e69de29
    """
    try :
      data = self.run_command(u"cd %s ; git rev-parse HEAD --no-color"%self.path)
    except NodeException as e :
      result = None
    else :
      result = data.strip(' \n')
    return result

  def push_to(self, local_project, target_project):
    """
    """
    data = self.run_command_and_feed_password_prompt(u'cd %s ; git push%sssh://%s@%s/%s'%(
                                                        self.path,
                                                        insecure,
                                                        target_project.user,
                                                        target_project.host,
                                                        target_project.path),
                                                        target_project.password)

  def pull_from(self, local_project, source_project):
    """
    """
    data = self.run_command_and_feed_password_prompt(u'cd %s ; git pull%sssh://%s@%s/%s'%(self.path,
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
        data = self.run_command(u'cd %s ; git --no-pager log --pretty=format:%s -r %s'%(self.path, self._template, revision_filter))
      elif branch_filter :
        data = self.run_command(u'cd %s ; git --no-pager log -n %d --pretty=format:%s HEAD %s'%(self.path, nb_lines, self._template, branch_filter))
      else :
        data = self.run_command(u'cd %s ; git --no-pager log -n %d --pretty=format:%s'%(self.path, nb_lines, self._template))
    except NodeException as e :
      data = ""

    list_nodes = []
    map_nodes = {}

    data = (line for line in data.splitlines())
    node = {}

    for line in data :
      node, author, branch, rev, parents, desc, tags = line.split(u'|#|')
      desc = desc.replace(u'\\n','\n')
      if not branch : branch = 'default'
      list_nodes.append({'node':node, 'branch':branch, 'author':author, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags})
      map_nodes[node]=list_nodes[-1]

    return list_nodes, map_nodes

  def get_file_content(self, file_name, revision):
    """
    """
    try :
      result = self.run_command(u"cd %s ; git cat %s -r %s"%(self.path, file_name, revision))
    except NodeException as e :
      result = None
    return result

  def get_initial_hash(self):
    """
      return the initial hash (revision 0)
      :return: string hash
    """
    try :
      data = self.run_command(u"cd %s ; git rev-list --max-parents=0 HEAD --no-color"%self.path)
    except NodeException as e :
      result = None
    else :
      result = data.strip(u' \n')
    return result

  def get_branches(self):
    """
      return a list of branches labels
    """
    branches = []
    try :
      data = self.run_command(u"cd %s ; git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'"%(self.path))
    except NodeException as e :
      pass
    else :
      branches = sorted((e.strip() for e in data.strip().split(u'\n') if e.strip()))
    return branches

  def get_current_revision_description(self):
    """
    """
    node = {}
    try :
      data = self.run_command(u'''cd %s ; git --debug id | cut -d' ' -f 1 | tr -d ' +' | xargs -I {} hg log -r {} --template "%s"'''%(self.path, self._template))
    except NodeException as e :
      node = {}
    else :
      node, author, branch, rev, parents, desc, tags = data.split(u'|#|')
      desc = desc.replace(u'\\n','\n')
      if not branch : branch = 'default'
      node = {'node':node, 'branch':branch, 'author':author, 'rev':rev, 'parents':parents, 'desc':desc, 'tags':tags}
    return node 

  def get_revision_diff(self, revision):
    """
    :param revision: the revision hash
    """
    diff_content = ""
    try :
      diff_content = self.run_command(u'''cd %s ; git diff -c %s'''%(self.path, revision))
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
      data = self.run_command(u'git reset ; git reset %s'%(self.path, rev), True)
  max_nodes_in_pool = 10
  def get_node(cls, uri, project_id):
    try to acquire a free ssh channel or open a new one ...
    node = None

      cls.nodes[uri] = [HgNode(uri, project_id)]
      node = cls.nodes[uri][0]
    else :
      for __node in cls.nodes[uri] :
        if not __node.state_locked :
          node = __node
          break

      if node is None and len(cls.nodes[uri]) < cls.max_nodes_in_pool :
        log.warning(u"creating additional node in pool (%s)"%(len(cls.nodes[uri])))
        node = HgNode(uri, project_id)
        cls.nodes[uri].append(node)
      elif node is None :
        log.warning(u"creating extra node (%s)"%(len(cls.nodes[uri])))
        # we create a new node to avoid flooding which will be
        # garbage collected at the end of request
        # this is slower but max nodes should represent a correct usage
        node = HgNode(uri, project_id)