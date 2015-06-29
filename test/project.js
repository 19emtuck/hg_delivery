if(!casper.cli.has("login")){
  casper.echo('please provide --login=xxxx argument', "ERROR");
  casper.exit();
}
if(!casper.cli.has("password")){
  casper.echo('please provide --password=xxxx argument', "ERROR");
  casper.exit();
}

var login      = casper.cli.get("login");
var password   = casper.cli.get("password");
var local_path = fs.workingDirectory;
var verbose    = false;

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.start();

if(casper.cli.has('verbose')){
  verbose = true;
}

casper.options.logLevel = 'debug';
casper.options.verbose = verbose;
casper.options.waitTimeout = 5000;

// fix view port to get large screenshot image
casper.viewport(1024, 768);


// some configuration events ...
casper.on('step.start', function(){
   this.evaluate(function(){document.body.bgColor = 'white';});
});
casper.on('step.complete', function(){
  if(!casper.cli.has('fast')){
    this.capture('images/projects_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/projects_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message);});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#log_me');
  this.thenClick('#log_me');
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

// then we delete the project if it exists.
casper.then(function(){
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'form[name="view_project"] button.dropdown-toggle');
  this.click('form[name="view_project"] button.dropdown-toggle');
  var bool_link_exist = this.evaluate(function(){
     return $('#projects_list a:contains("d1")').size()>0;
  });
  if(bool_link_exist){
    var next_link = this.evaluate(function(){
       return $('#projects_list a:contains("d1")').attr('href');
    });
    this.thenOpen(next_link);
    this.waitUntilVisible('#project_home');
    this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#manage_project');
    this.thenClick('#manage_project');
    this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#view_delete_project');
    this.thenClick('#view_delete_project');
  }
});

casper.waitForSelector('span[class="glyphicon glyphicon-plus"]', function(){
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
// add a new project
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.fill('form[name="project_add"]', { 'name':'d1',
                                          'host':'127.0.0.1',
                                          'path': local_path + '/repositories/d1',
                                          'user':login,
                                          'password':password});
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_project');
casper.thenClick('#add_my_project');
casper.waitWhileVisible('#new_project_dialog');
casper.waitUntilVisible('.alert-success');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_project');

// try to add the same project twice !
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.fill('form[name="project_add"]', {'name':'d1',
                   'host':'127.0.0.1',
                   'path': local_path + '/repositories/d1',
                   'user':login,
                   'password':password
              });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_project');
casper.thenClick('#add_my_project');
casper.waitUntilVisible('.alert-danger');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_project');
casper.thenClick("#cancel_add_project");
casper.waitWhileVisible('#new_project_dialog');

// then we delete the project
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'form[name="view_project"] button.dropdown-toggle');
casper.thenClick('form[name="view_project"] button.dropdown-toggle');
casper.then(function(response){this.test.assertTextExists('d1');});
casper.then(function(){
  var next_link = this.evaluate(function(){
     return $('#projects_list a:contains("d1")').attr('href');
  });
  this.thenOpen(next_link);
});
casper.waitUntilVisible('#project_home');
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#manage_project');
casper.thenClick('#manage_project');

// finally we delete him ...
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#view_delete_project');
casper.thenClick('#view_delete_project');

// back to welcome page ...
casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});


// add d1 project for normal test behavior
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.then(function(response){
  this.fill('form[name="project_add"]', { 'name':'d1',
                                          'host':'127.0.0.1',
                                          'path': local_path + '/repositories/d1',
                                          'user':login,
                                          'password':password
                                        });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'add_my_project');
casper.thenClick('#add_my_project');
casper.waitWhileVisible('#new_project_dialog');
casper.waitUntilVisible('.alert-success');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_project');

casper.run();
