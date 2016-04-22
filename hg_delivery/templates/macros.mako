<%inherit file="base.mako"/>

<h2>All projects macros :</h2>

<div class="tab-pane" id="macros">
%for project in dict_project_to_macros :
  <h3><a href="${url(route_name='project_edit',id=project.id)}">Project : ${project.name}</a></h3>
  <ul id="macros_list">
    %for macro in dict_project_to_macros[project] :
     <li>
          <input type="text" name="macro_content" value="${macro.label}">
     </li>
    %endfor
  </ul>
%endfor
</div>

