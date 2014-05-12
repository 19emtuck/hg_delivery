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
          <a class="navbar-brand" href="#">HgDelivery</a>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          %if projects_list :
            <form name="view_project" class="navbar-form pull-right">
               <select id="project_name" class="form-control" name="project_name" onchange="">
                 <option value="">-- projects --</option>
                 % for project in projects_list :
                 <option value="${project.id}">${project.name}</option>
                 % endfor
               </select>
            </form>
          %else :
           <form class="navbar-form pull-right">
             <input class="span2" type="text" placeholder="Email">
             <input class="span2" type="password" placeholder="Password">
             <button type="submit" class="btn btn-primary">Sign in</button>
           </form>
          %endif
        </div><!--/.nav-collapse -->
      </div>
    </div>

    <div class="container">
      <div class="starter-template">
        <h1>Welcome to HgDelivery webapp</h1>
        <p class="lead">The purpose of HgDelivery webapp is to allow people to deliver or manage new release
        easily</p>
        <button type="button" id="view_new_project" class="btn btn-primary" onclick="$('#new_project').toggle();">Add a new project</button>
      </div>

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
            <button type="button" class="btn btn-primary" onclick="add_project('${request.route_url('project_add')}');">Add this project</button>
         <form>
      </div>
    </div><!-- /.container -->
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="${request.static_url('hg_delivery:static/jquery-1.11.1.min.js')}"></script>
    <script src="${request.static_url('hg_delivery:static/main.js')}"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="${request.static_url('hg_delivery:static/bootstrap-3.1.1/js/bootstrap.min.js')}"></script>
  </body>
</html>
