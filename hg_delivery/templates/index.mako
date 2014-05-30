<%inherit file="base.mako"/>

% if logged_in is not None :
  <br>
  <button type="button" id="view_new_project" class="btn btn-primary" onclick="$('#new_project').toggle();">Add a new project</button>
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

  <h2><span class="label label-default">Dashboard</span></h2>

  %for project in dashboard_list :
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><a href="${url(route_name='project_edit',id=project.id)}"><b>${project.name}</b></a>  <i>(revision : ${nodes_description[project.id]['rev']})</i></h3>
      </div>
      <div class="panel-body">
        current branch : <span class="label label-warning"> ${nodes_description[project.id]['branch']}</span
        <br>
        <br>
        current hash : <i>${nodes_description[project.id]['node']}</i>
        <br>
        current comment : <i>${nodes_description[project.id]['desc']}</i>
      </div>
    </div>
  %endfor

% else :

 <div class="starter-template">
   <h1>Welcome to HgDelivery webapp</h1>
   <p class="lead">The purpose of HgDelivery webapp is to allow people to deliver or manage new release easily</p>
   <br>
   <br>
   <br>
   <br>
   <p class="lead"><b>Please login before proceeding</b></p>
 </div>

% endif

<%block name="local_js">
</%block>
