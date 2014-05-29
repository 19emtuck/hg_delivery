<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hg Delivery 1.0</title>

    <!-- Bootstrap -->
    <link href="${request.static_url('hg_delivery:static/bootstrap-3.1.1/css/bootstrap.min.css')}" rel="stylesheet">
    <link href="${request.static_url('hg_delivery:static/bootstrap-3.1.1/css/delivery.css')}" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>

    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="/">HgDelivery</a>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="#contact">Contact</a></li>
             % if logged_in is not None :
            <li><a href="${url('logout')}">Sign out</a></li>
             % endif
          </ul>
          % if logged_in is not None :
            <form name="view_project" class="navbar-form pull-right">
               % if projects_list :
               <!-- Single button for project management-->
               <div class="btn-group">
                 <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                   % if project is not UNDEFINED:
                     <span id="project_name">${project.name}</span> <span class="caret"></span>
                   % else :
                     Projects <span class="caret"></span>
                   % endif
                 </button>
                 <ul id="projects_list" class="dropdown-menu" role="menu" data-url="${url(route_name='project_edit',id='')}">
                 % for __project in projects_list :
                   <li><a href="${url(route_name='project_edit',id=__project.id)}">${__project.name}</a></li>
                 % endfor
                 </ul>
               </div>
               % endif

               % if project is not UNDEFINED :
               <!-- Single button for project management-->
               <div class="btn-group" style="margin-left:20px">
                 <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" style="min-width:80px">
                   Manage project <span class="caret"></span>
                 </button>
                 <ul class="dropdown-menu" role="menu">
                   <li><a href="#" onclick="$('#edit_project').toggle();">Edit properties</a></li>
                   <li class="divider"></li>
                   <li><a id="view_delete_project" href="#" onclick="delete_this_project()" data-url="${url(route_name='project_delete',id=project.id)}">Delete</a></li>
                 </ul>
               </div>
               % endif

            </form>
          % endif
          % if logged_in is None :
            <form id="login_form" class="navbar-form pull-right" action="${url('login')}" method='POST'>
              <input class="span2" name="login" type="text" placeholder="Email">
              <input class="span2" name="password" type="password" placeholder="Password">
              <button type="submit" class="btn btn-primary" onclick="$('#login_form').submit()">Sign in</button>
            </form>
          %endif
        </div><!--/.nav-collapse -->
      </div>
    </div>

    <div class="container">
      ${self.body()}
    </div>
    <!-- /.container -->

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="${request.static_url('hg_delivery:static/jquery-1.11.1.min.js')}"></script>
    <script src="${request.static_url('hg_delivery:static/main.js')}"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="${request.static_url('hg_delivery:static/bootstrap-3.1.1/js/bootstrap.min.js')}"></script>
    
    <%block name="local_js">
    <!-- define local script ... -->
    </%block>
  </body>
</html>
