<%!
  import json
  from pygments import highlight
  from pygments.lexers import DiffLexer
  from pygments.formatters import HtmlFormatter
  from pygments.styles import get_all_styles 
  styles = list(get_all_styles())
%>
<%inherit file="base.mako"/>

${ highlight(diff_content, DiffLexer(), HtmlFormatter(cssclass='source', style='colorful')) |n}
