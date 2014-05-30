<%inherit file="base.mako"/>

<div id="overview" class="starter-template">
% if current_node is not UNDEFINED and current_node is not None :
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title"><b>${project.name}</b> position @revision : <i>${current_node['rev']} (${current_node['node']})</i></h3>
    </div>
    <div class="panel-body">
        <span class="label label-warning"> ${current_node['branch']}</span
        <br>
        <br>
        ${current_node['desc']}
    </div>
  </div>
% endif
</div>

<div "filter">
  <form id="refresh" name="refresh" action="" method="POST" role="form">
    <!-- Single button for project management-->
    <div class="btn-group" style="margin-left:20px">
      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" style="min-width:80px">
        %if filter_branch :
          <span id="branch_name">${filter_branch}</span> <span class="caret"></span>
        %else :
          All branches<span class="caret"></span>
        %endif
      </button>
      <ul class="dropdown-menu" role="menu">
      %if filter_branch :
        <li><a href="#" onclick="$('#branch').val('');$('#refresh').submit()">All branches</a></li>
      %endif
      %for _branch in list_branches :
        <li><a href="#" onclick="$('#branch').val('${_branch}');$('#refresh').submit()">${_branch}</a></li>
      %endfor
      </ul>
    </div>
    &nbsp;
    <input type="hidden" id="branch" name="branch" value="">
    <input type="text" name="limit" value="${limit}" size="3" maxlength="4">
    &nbsp;
    <button id="view_refresh_project" class="btn btn-primary">Update this view</button>
  </form>
</div>

<div id="edit_project_dialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">


      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title">Add a new project</h4>
      </div>


      <div class="modal-body">
        <div id="edit_project">
           <form id="project" name="project" action="${url(route_name='project_update',id=project.id)}" method="post" class="form-horizontal" role="form">
              <div class="form-group">
                <label for="project_name" class="col-sm-4 control-label">Name</label>
                <div class="col-sm-7">
                  <input id="project_name" class="form-control" name="name" type="text" placeholder="name" value="${project.name}">
                </div>
              </div>
              <div class="form-group">
                <label for="project_host" class="col-sm-4 control-label">Host</label>
                <div class="col-sm-7">
                  <input id="project_host" class="form-control" name="host" type="text" placeholder="hostname" value="${project.host}">
                </div>
              </div>
              <div class="form-group">
                <label for="project_path" class="col-sm-4 control-label">Folder</label>
                <div class="col-sm-7">
                  <input id="project_path" class="form-control" name="path" type="text" placeholder="/home/sites ..." value="${project.path}">
                </div>
              </div>
              <div class="form-group">
                <label for="project_user" class="col-sm-4 control-label">User</label>
                <div class="col-sm-7">
                  <input id="project_user" class="form-control" name="user" type="text" placeholder="user" value="${project.user}">
                </div>
              </div>
              <div class="form-group">
                <label for="project_password" class="col-sm-4 control-label">Passwd</label>
                <div class="col-sm-7">
                  <input id="project_password" class="form-control" name="password" type="password" placeholder="password" value="${project.password}">
                </div>
              </div>
              <div class="form-group">
                <label for="project_dashboard" class="col-sm-4 control-label">Clip to dashboard</label>
                <div class="col-sm-7">
                  % if project.dashboard :
                    <input id="project_dashboard" class="form-control" name="dashboard" type="checkbox" placeholder="dashboard" value="1" checked>
                  % else :
                    <input id="project_dashboard" class="form-control" name="dashboard" type="checkbox" placeholder="dashboard" value="1">
                  % endif
                </div>
              </div>
           <form>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" onclick="update_project('${url('project_update', id=project.id)}');">Save changes</button>
      </div>

    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->



<!-- node tables -->
<table class="table">
   <thead>
     <th></th>
     <th>Revision</th>
     <th>Author</th>
     <th>Branch</th>
     <th>Description</th>
   </thead>
   <tbody>
    %for node in last_hundred_change_sets :
      <tr>
       %if node['node'] == current_node['node']:
       <td><span class="glyphicon glyphicon-ok" style="color:#f0ad4e"></span></td>
       %else :
       <td></td>
       %endif
       <td><span title="${node['node']}">${node['rev']}</span></td>
       <td>${node['author']}</td>
       %if node['node'] == current_node['node']:
         <td><span class="label label-warning">${node['branch']}</span></td>
       %else :
         <td><span class="label label-success">${node['branch']}</span></td>
       %endif
       %if node['node'] == current_node['node']:
       <td><a href="${url('project_change_to',id=project.id, rev=node['node'])}" title="revert to the node ${node['rev']}" ><span class="label label-warning">${node['desc']}</span></a></td>
       %else :
       <td><a href="${url('project_change_to',id=project.id, rev=node['node'])}" title="revert to the node ${node['rev']}" >${node['desc']}</a></td>
       %endif
      </tr>
    %endfor
   </tbody>
</table>

%if repository_error is not None:
  <div class="alert alert-danger">Sorry this repository is not available. Thanks to check configuration to solve this issue.
    You'll find bellow more technical details :
    <br>
    <br>
    <b>${repository_error}</b>
  </div>
%endif
