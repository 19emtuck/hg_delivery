<%!
  import json
  import os.path
%>
<%inherit file="base.mako"/>
<%namespace name="lib" file="lib.mako"/>
  <h2>
        <span class="label label-default">User management</span>
        <button style="background-color:transparent;border:none" onclick="$('#new_user_dialog').modal('show');" alt="add new project">
          <span class='glyphicon glyphicon-plus' style="font-size:26px;vertical-align:bottom"></span>
        </button>
  </h2>

  <div id="overview" class="panel panel-default">
    <div>
       <p class="bg-info" style="padding-top:5px;padding-bottom:5px">
         &nbsp; ADD &nbsp; DELETE &nbsp; MANAGE users ...
       </p>
    <div>
    <div>
       <!-- project compare table -->
       <table id="users_overview" class="table table-condensed" data-update_url="${url('users_json')}">
          <thead>
            <th>Login</th>
            <th>Email</th>
            <th>Creation date</th>
          </thead>
          <tbody>
            % for user in lst_users :
               <tr>
                  <td>${user.login}</td>
                  <td>${user.email}</td>
                  <td>${user.creation_date.strftime('%d/%m/%Y %H:%M')}</td>
                  <td><button onclick="delete_user(this,'${url(delete_user, id=user.id)}')">delete</button></td>
               </tr>
            % endfor
          </tbody>
       </table>
    <div>
  </div>

${lib.publish_user_dialog()}
