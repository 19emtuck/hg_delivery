<%inherit file="base.mako"/>

<h2><span class="label label-default">Dashboard</span></h2>

%for project in lst_projects :
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title"><b>${project.name}</b>  <i>(revision : ${nodes_description[project.id]['rev']})</i></h3>
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
