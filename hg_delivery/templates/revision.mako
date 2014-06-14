<%!
  import json
  from pygments import highlight
  from pygments.lexers import DiffLexer
  from pygments.formatters import HtmlFormatter
  from pygments.styles import get_all_styles 
  styles = list(get_all_styles())
%>
<%inherit file="base.mako"/>

<div id="overview" class="panel panel-default" style="margin:10px 10px">
  <div class="panel-body">
  % if diff_content :
    ${ highlight(diff_content, DiffLexer(), HtmlFormatter(cssclass='source', style='colorful')) |n}
  % else :
    <p class="bg-info">
      <br>
      &nbsp;  No diff is available for this revision
      <br>
      <br>
    </p>
  % endif
  </div>
</div>
