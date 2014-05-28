<%inherit file="base.mako"/>

<h2><span class="label label-default">Dashboard</span></h2>

%for project in lst_projects :
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title"><b>${project.name}</b>  revision : ${nodes_description[project.id]['node']}</h3>
    </div>
    <div class="panel-body">
      <span class="label label-warning"> ${nodes_description[project.id]['branch']}</span
      <br>
      <br>
      <br>
      ${nodes_description[project.id]['desc']}
    </div>
  </div>
%endfor
