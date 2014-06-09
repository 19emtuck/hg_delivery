<%!
  import json
%>
<%inherit file="base.mako"/>

<div id="overview" class="starter-template row" style="padding:10px 10px">

% if current_node is not UNDEFINED and current_node is not None :
  <div class="panel panel-default col-md-5" style="padding-left:0px;padding-right:0px;">
    <div class="panel-heading">
      <h3 class="panel-title">project <b>${project.name}</b> position @revision : <i>${current_node.get('rev','UNKNOWN')}</i></h3>
    </div>
    <div class="panel-body">
        ${current_node.get('node','UNKNOWN')}
        <br>
        <span class="label label-warning"> ${current_node.get('branch','UNKNOWN')}</span>
        <br>
        ${current_node.get('desc','UNKNOWN')}
    </div>
  </div>
% endif

  <div class="panel panel-default col-md-3" style="margin-left:20px;padding-left:0px;padding-right:0px;">
    <div class="panel-heading">
      <h3 class="panel-title">Related projects</h3>
    </div>
    <div class="panel-body">
       <div id="other_projects" class="list-group">
         %for link in linked_projects :
           <a href="#" class="list-group-item" data-url="${url(route_name='project_fetch',id=link.id)}" data-name="${link.name}" onclick="fetch_this_other_project(this)">${link.name}</a>
         %endfor
       </div>
    </div>
  </div>
  <div id="filter" class="panel panel-default col-md-2" style="margin-left:20px;padding-left:0px;padding-right:0px;">
    <div class="panel-heading">
      <h3 class="panel-title">Filter</h3>
    </div>

    <form id="refresh" name="refresh" action="" method="POST" role="form">
      <div class="btn-group" style="margin-left:20px;margin-top:10px">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" style="min-width:80px">
          %if filter_branch :
            <span id="branch_name">${filter_branch}</span> <span class="caret"></span>
          %else :
            All branches <span class="caret"></span>
          %endif
        </button>
        <ul class="dropdown-menu" role="menu">
        %if filter_branch :
          <li><a href="#" onclick="$('#branch').val('');$('#refresh').submit()"><b>All branches</b></a></li>
        %endif
        %for _branch in list_branches :
          <li><a href="#" onclick="$('#branch').val('${_branch}');$('#refresh').submit()">${_branch}</a></li>
        %endfor
        </ul>
      </div>
      <div style="margin-left:20px;margin-top:10px">
       <input type="hidden" id="branch" name="branch" value="">
       <input type="text" name="limit" value="${limit}" size="3" maxlength="4">
      </div>
      <div style="margin-left:20px;margin-top:10px;margin-bottom:10px">
        <button id="view_refresh_project" class="btn btn-primary">Filter this view</button>
      </div>
    </form>
  </div>

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

<div id="confirm_move_dialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title">Are you sure to update this project ?</h4>
      </div>
      <div class="modal-body">
        from <span id="src_revision"></span> to <span id="target_revision"></span> revision
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="move_to" type="button" class="btn btn-primary">Move to this revision</button>
      </div>

    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<div class="panel">

 <!-- node tables -->
 <table id="project_tab"class="table table-condensed">
    <thead>
      <th></th>
      <th>Rev.</th>
      <th>Tag</th>
      <th>Author</th>
      <th>Branch</th>
      <th>Description</th>
    </thead>
 
    <tbody>
     %for node in last_hundred_change_list :
       <tr>
        %if node['node'] == current_node.get('node'):
           <td><span class="glyphicon glyphicon-ok" data-current_rev="${current_node['rev']}" style="color:#f0ad4e;font-size:27px"></span></td>
        %else :
          <td></td>
        %endif
        <td>
          <a href="#" onclick="change_project_to_this_release(this, '${url('project_change_to',id=project.id, rev=node['node'])}')" title="revert to the node ${node['node']}">${node['rev']}</a>
        </td>
 
        %if node['tags']:
          <td><span title="${node['tags']}"><span class="glyphicon glyphicon-star" style="font-size:27px"></span></td>
        %else :
          <td></td>
        %endif :
 
        <td>${node['author']}</td>
 
        %if node['node'] == current_node.get('node'):
          <td><span class="label label-warning">${node['branch']}</span></td>
        %else :
          <td><span class="label label-success">${node['branch']}</span></td>
        %endif
        <td> ${node['desc']} </td>

       </tr>
     %endfor
    </tbody>
 </table>

 <!-- project compare table -->
 <table id="project_comparison" class="table table-condensed" style="display:none">
    <thead>
      <th></th>
      <th>Rev <span id="p_name_remote"></span></th>
      <th>Rev <span id="p_name_local"></span></th>
      <th></th>
      <th>Author</th>
      <th>Branch</th>
      <th>Description</th>
    </thead>
    <tbody>
    </tbody>
 </table>

</div>

%if repository_error is not None:
  <div class="alert alert-danger">Sorry this repository is not available. Thanks to check configuration to solve this issue.
    You'll find bellow more technical details :
    <br>
    <br>
    <b>${repository_error}</b>
  </div>
%endif

<%block name="local_js">
  <script>
  var local_project_name = "${project.name}";
  var local_project_last_change_list = ${json.dumps(last_hundred_change_list)|n}
  var current_node = ${json.dumps(current_node)|n}
  </script>
</%block>


