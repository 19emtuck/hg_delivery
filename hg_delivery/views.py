from pyramid.response import Response
from pyramid.view import view_config

from sqlalchemy.exc import DBAPIError, IntegrityError

from .models import (
    DBSession,
    Project,
    )

def exec_command(server, command, **kwargs):
    FAB_FILE = '%s/deployer/fabric/fabfile.py'%PROJECT_ROOT
    command_args = ''
    for k,v in kwargs.iteritems():
        if not v:
            raise Exception("value for argument '%s' must be provided '\
                                'when calling %s"%(k, command))

    command_with_args = command
    command_args = ','.join(['%s=%s'%(k,v) for k,v in kwargs.iteritems()])
    if command_args:
        command_with_args = "%s:%s"%(command, command_args)

    CMD_FORMAT = 'fab --fabfile=%(file)s %(command)s '\
                 '--hosts=%(host)s --user=%(user)s --password=LeZUMDH='

    # create full fabric command
    cmd = CMD_FORMAT%{
        'command': command_with_args,
        'host': server['host'],
        'user': server['user'],
        'ssh_key': server['ssh_key'],
        'file': FAB_FILE
    }

    cmd = str(cmd)
    cmd_call = shlex.split(cmd)
    # get the output
    full_output = subprocess.Popen(cmd_call,stdout=subprocess.PIPE,
                                 stdin=subprocess.PIPE,
                                 stderr=subprocess.STDOUT).communicate()[0]

    # our_output = '\n'.join(re.findall('(?i).*\ out\:\ (.+)\r', full_output))
    our_output = full_output

    # log.log(command+': '+cmd)
    # if command == 'get_remote_log':
    #     log.log('skipping large output\n')
    # else:
    #     log.log(our_output+'\n')
    with open('test.txt','wb') as f_log :
      f_log.write(cmd+'\n')
    return our_output

def read_branches(directory):
  """
  """
  return run("hg log -l 1 -b %s --template {node}"%branch_name)


@view_config(route_name='home', renderer='templates/index.mako')
def default_view(request):
    """
    """
    remote_directory = '/home/sbard/dev/sidexa/hg_power'
    return {}

@view_config(route_name='project_add', renderer='json', permission='edit')
def add_project(request):
    """
    """
    result = False
    explanation = None

    host = request.params['host']
    path = request.params['path']

    if not host :
      explanation = u'Your project should contain a valid hostname'
    elif not path :
      explanation = u'Your project should contain a valid path'
    else:
      try :
        # folder should be unique
        project = Project(**request.params)
        DBSession.add(project)
        DBSession.flush()
        result = True
        explanation = u'This project (%s %s) has been added...'%(host, path)
      except IntegrityError as e:
        DBSession.rollback()
        result = False
        explanation = u'This project and this path are already defined (%s %s)...'%(host, path)

    projects_list =  DBSession.query(Project).all()
    return { 'result':result,
             'projects_list':projects_list,
             'explanation':explanation}

@view_config(route_name='project_update', permission='edit', renderer='json')
def update_project(request):
    """
    """
    result = False
    id_project = request.matchdict['id']

    host = request.params['host']
    path = request.params['path']
    project = None
    explanation = None

    if not host :
      explanation = u'Your project should contain a valid hostname'
    elif not path :
      explanation = u'Your project should contain a valid path'
    else:
      try :
        project =  DBSession.query(Project).get(id_project)
        for key in request.params :
          setattr(project, key, request.params[key])
        DBSession.flush()
      except :
        DBSession.rollback()
        result = False

    return {'result':result, 'project':project, 'explanation':explanation}

@view_config(route_name='project_delete', renderer='json', permission='edit')
def delete_project(request):
    """
    """
    result = False
    try :
      id_project = request.matchdict['id']
      project =  DBSession.query(Project).get(id_project)
      DBSession.delete(project)
      DBSession.flush()
      result = True
    except :
      DBSession.rollback()
      result = False
    return {'result':result}

@view_config(route_name='project_edit', renderer='edit.mako', permission='edit')
def edit_project(request):
    """
    """
    result = False
    id_project = request.matchdict['id']
    project =  DBSession.query(Project).get(id_project)
    return {'project':project}

