<%inherit file="base.mako"/>

% if logged_in is not None :
  <h2><span class="label label-default">Dashboard</span></h2>

  %for project in dashboard_list :
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><a
href="${url(route_name='project_edit',id=project.id)}"><b>${project.name}</b></a><i>(revision : ${nodes_description[project.id].get('rev','UNKNOWN')})</i></h3>
      </div>
      <div class="panel-body">
        current branch : <span class="label label-warning"> ${nodes_description[project.id].get('branch','UNKNOWN')}</span
        <br>
        <br>
        current hash : <i>${nodes_description[project.id].get('node','UNKNOWN')}</i>
        <br>
        current comment : <i>${nodes_description[project.id].get('desc','UNKNOWN')}</i>
      </div>
    </div>
  %endfor
  %if not dashboard_list :
      > <i>The dashboard is empty</i>
  %endif

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

% if logged_in is not None :
  <div id="new_project_dialog" class="modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 class="modal-title">Add a new project</h4>
        </div>
        <div class="modal-body">
          <form id="project" name="project" action="/project/add" method="post" class="form-horizontal" role="form">
            <div id="new_project">
                <div class="form-group">
                  <label for="new_project_name" class="col-sm-2 control-label">Name</label>
                  <div class="col-sm-8">
                    <input id="new_project_name" class="form-control" name="name" type="text" placeholder="name">
                  </div>
                </div>
                <div class="form-group">
                  <label for="new_project_host" class="col-sm-2 control-label">Host</label>
                  <div class="col-sm-8">
                    <input id="new_project_host" class="form-control" name="host" type="text" placeholder="hostname">
                  </div>
                </div>
                <div class="form-group">
                  <label for="new_project_path" class="col-sm-2 control-label">Folder</label>
                  <div class="col-sm-8">
                    <input id="new_project_path" class="form-control" name="path" type="text" placeholder="/home/sites ...">
                  </div>
                </div>
                <div class="form-group">
                  <label for="new_project_user" class="col-sm-2 control-label">User</label>
                  <div class="col-sm-8">
                    <input id="new_project_user" class="form-control" name="user" type="text" placeholder="user">
                  </div>
                </div>
                <div class="form-group">
                  <label for="new_project_password" class="col-sm-2 control-label">Passwd</label>
                  <div class="col-sm-8">
                    <input id="new_project_password" class="form-control" name="password" type="password" placeholder="password">
                    <input name="dashboard" type="hidden" value="0">
                    <input name="rev_init" type="hidden" value="0">
                    <input name="dvcs_release" type="hidden" value="">
                  </div>
                </div>
            </div>
          <form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="add_project('${url('project_add')}');">Save changes</button>
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
% endif

<%block name="local_js">
</%block>


