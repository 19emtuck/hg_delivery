<%inherit file="base.mako"/>

<div class="starter-template">
  <h1>Welcome to HgDelivery webapp</h1>
  <p class="lead">The purpose of HgDelivery webapp is to allow people to deliver or manage new release easily</p>
  % if logged_in is not None:
    <button type="button" id="view_new_project" class="btn btn-primary" onclick="$('#new_project').toggle();">Add a new project</button>
  % else :
    <br>
    <br>
    <br>
    <br>
    <p class="lead"><b>Please login before proceeding</b></p>
  % endif
</div>

% if logged_in is not None and projects_list :
  <div id="new_project" style="width:300px;display:None">
     <form id="project" name="project" action="/project/add" method="post" class="form-horizontal" role="form">
        <div class="form-group">
          <label for="new_project_name" class="col-sm-2 control-label">Name</label>
          <div class="col-sm-10">
            <input id="new_project_name" class="form-control" name="name" type="text" placeholder="name">
          </div>
        </div>
        <div class="form-group">
          <label for="new_project_host" class="col-sm-2 control-label">Host</label>
          <div class="col-sm-10">
            <input id="new_project_host" class="form-control" name="host" type="text" placeholder="hostname">
          </div>
        </div>
        <div class="form-group">
          <label for="new_project_path" class="col-sm-2 control-label">Folder</label>
          <div class="col-sm-10">
            <input id="new_project_path" class="form-control" name="path" type="text" placeholder="/home/sites ...">
          </div>
        </div>
        <div class="form-group">
          <label for="new_project_user" class="col-sm-2 control-label">User</label>
          <div class="col-sm-10">
            <input id="new_project_user" class="form-control" name="user" type="text" placeholder="user">
          </div>
        </div>
        <div class="form-group">
          <label for="new_project_password" class="col-sm-2 control-label">Passwd</label>
          <div class="col-sm-10">
            <input id="new_project_password" class="form-control" name="password" type="password" placeholder="password">
          </div>
        </div>
        <button type="button" class="btn btn-primary" onclick="add_project('${url('project_add')}');">Add this project</button>
     <form>
  </div>
% else :

% endif
