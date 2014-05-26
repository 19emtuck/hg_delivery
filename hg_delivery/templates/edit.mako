<%inherit file="base.mako"/>

<div class="starter-template">
  Le projet : ${project.name}

  <button type="button" id="view_delete_project" class="btn btn-primary" onclick="delete_this_project()" data-url="${url(route_name='project_delete',id=project.id)}">Delete this project</button>
  <button type="button" id="view_edit_project" class="btn btn-primary" onclick="$('#edit_project').toggle();">Edit properties of this project</button>
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
      <button type="button" class="btn btn-primary" onclick="update_project('${url('project_update', id=project.id)}');">Update this project</button>
   <form>
</div>

<!-- node tables -->
<table widht="100%" border="1">
   <thead>
     <th></th>
     <th>Revision Number</th>
     <th>Branch</th>
     <th>Description</th>
   </thead>

 %for node in last_hundred_change_sets :
   <tr>
    %if node['node'].count(state):
    <td><b>&gt;&gt;</b></td>
    %else :
    <td></td>
    %endif
    <td><span title="${node['node']}">${node['rev']}</span></td>
    <td>${node['branche']}</td>
    <td><a href="${url('project_change_to',id=project.id, rev=node['node'])}" title="revert to the node ${node['rev']}" >${node['desc']}</a></td>
   </tr>
 %endfor

</table>
