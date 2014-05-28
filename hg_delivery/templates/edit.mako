<%inherit file="base.mako"/>

<div class="starter-template">


  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title"><b>${project.name}</b>  revision : ${current_rev}</h3>
    </div>
    <div class="panel-body">
      % if current_node is not UNDEFINED and current_node:
        <span class="label label-warning"> ${current_node['branch']}</span
        <br>
        <br>
        ${current_node['desc']}
      % endif
    </div>
  </div>



</div>

<div>
  <form id="refresh" name="refresh" action="" method="POST" role="form">
    <select id="branch" name="branch" onchange="$('#refresh').submit();">
      <option value=""> All </option>
      %for _branch in list_branches :
        %if filter_branch and filter_branch == _branch :
          <option selected>${_branch}</option>
        % else :
          <option>${_branch}</option>
        % endif
      %endfor
    </select>
    &nbsp;
    <input type="text" name="limit" value="${limit}" size="3" maxlength="4">
    &nbsp;
    <button id="view_refresh_project" class="btn btn-primary">Update this view</button>
  </form>
</div>

<div id="edit_project" style="width:300px;display:None">
   <form id="project" name="project" action="${url(route_name='project_update',id=project.id)}" method="post" class="form-horizontal" role="form">
      <div class="form-group">
        <label for="project_name" class="col-sm-2 control-label">Name</label>
        <div class="col-sm-10">
          <input id="project_name" class="form-control" name="name" type="text" placeholder="name" value="${project.name}">
        </div>
      </div>
      <div class="form-group">
        <label for="project_host" class="col-sm-2 control-label">Host</label>
        <div class="col-sm-10">
          <input id="project_host" class="form-control" name="host" type="text" placeholder="hostname" value="${project.host}">
        </div>
      </div>
      <div class="form-group">
        <label for="project_path" class="col-sm-2 control-label">Folder</label>
        <div class="col-sm-10">
          <input id="project_path" class="form-control" name="path" type="text" placeholder="/home/sites ..." value="${project.path}">
        </div>
      </div>
      <div class="form-group">
        <label for="project_user" class="col-sm-2 control-label">User</label>
        <div class="col-sm-10">
          <input id="project_user" class="form-control" name="user" type="text" placeholder="user" value="${project.user}">
        </div>
      </div>
      <div class="form-group">
        <label for="project_password" class="col-sm-2 control-label">Passwd</label>
        <div class="col-sm-10">
          <input id="project_password" class="form-control" name="password" type="password" placeholder="password" value="${project.password}">
        </div>
      </div>
      <div class="form-group">
        <label for="project_dashboard" class="col-sm-2 control-label">Dashboard</label>
        <div class="col-sm-10">

          % if project.dashboard :
            <input id="project_dashboard" class="form-control" name="dashboard" type="checkbox" placeholder="dashboard" value="1" checked>
          % else :
            <input id="project_dashboard" class="form-control" name="dashboard" type="checkbox" placeholder="dashboard" value="1">
          % endif

        </div>
      </div>
      <button type="button" class="btn btn-primary" onclick="update_project('${url('project_update', id=project.id)}');">Update this project</button>
   <form>
</div>

<!-- node tables -->
<table class="table">
   <thead>
     <th></th>
     <th>Revision</th>
     <th>Branch</th>
     <th>Description</th>
   </thead>
   <tbody>
    %for node in last_hundred_change_sets :
      <tr>
       %if node['node'] == current_rev:
       <td><span class="label label-warning">&gt;&gt;</span></td>
       %else :
       <td></td>
       %endif
       <td><span title="${node['node']}">${node['rev']}</span></td>
       %if node['node'] == current_rev:
         <td><span class="label label-warning">${node['branch']}</span></td>
       %else :
         <td><span class="label label-success">${node['branch']}</span></td>
       %endif
       <td><a href="${url('project_change_to',id=project.id, rev=node['node'])}" title="revert to the node ${node['rev']}" >${node['desc']}</a></td>
      </tr>
    %endfor
   </tbody>
</table>
