<%inherit file="base.mako"/>

<div class="starter-template">
  Le projet : ${project.name}

  <button type="button" id="view_delete_project" class="btn btn-primary" onclick="delete_this_project(${project.id})" data-url="${url(route_name='project_delete',id='')}">Delete this project</button>
</div>

