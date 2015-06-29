if(!casper.cli.has("login")){
  casper.echo('please provide --login=xxxx argument', "ERROR");
  casper.exit();
}
if(!casper.cli.has("password")){
  casper.echo('please provide --password=xxxx argument', "ERROR");
  casper.exit();
}

var javascript_errors = [];
var local_path        = fs.workingDirectory;
var login             = casper.cli.get("login");
var password          = casper.cli.get("password");

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.start();

// fix view port to get large screenshot image
casper.viewport(1024, 768);


// some configuration events ...
casper.on('step.start', function(){
   this.evaluate(function(){document.body.bgColor = 'white';});
});
casper.on('step.complete', function(){
  if(!casper.cli.has('fast')){
    this.capture('images/projects_add_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});

casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/projects_add_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message);});

casper.on("page.error", function(msg, trace) {
  this.echo("-> Error:    " + msg, "ERROR");
  this.echo("-> Trace:    " + trace, "ERROR");
  javascript_errors.push(msg);
});

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

// loop over projects to remove them ...
casper.then(function(){
 projects_names = this.evaluate(function() {
   return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
 });
 // require('utils').dump(projects_names);

 this.each(projects_names, function(self, next_link){
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'form[name="view_project"] button.dropdown-toggle');
    self.thenClick('form[name="view_project"] button.dropdown-toggle');
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, "a[href='"+next_link+"']");
    self.thenClick("a[href='"+next_link+"']");
    self.waitUntilVisible('#project_home');
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#manage_project');
    self.thenClick('#manage_project');
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#view_delete_project');
    self.thenClick('#view_delete_project');
    self.waitUntilVisible('form[name="view_project"] button.dropdown-toggle');
    // wait a bit ...
    self.wait(700);
 });

});

casper.then(function(){
  var projects_names = this.evaluate(function() {
      return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
  });
  casper.test.assertEquals(projects_names.length, 0);
});

casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]',
    function(){this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.then(function(){
 this.each(['d1','d2','d3'], function(self, project_id){
    // add a new project
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
    self.thenClick('span[class="glyphicon glyphicon-plus"]');
    self.then(function(response){ this.test.assertExists('#add_my_project'); });
    self.then(function(response){
      this.fill('form[name="project_add"]', { 'name':project_id,
                                              'host':'127.0.0.1',
                                              'path': local_path + '/repositories/' +project_id,
                                              'user':login,
                                              'password':password });
    });
    self.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
    self.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_project');
    self.thenClick('#add_my_project');
    self.waitWhileVisible('#new_project_dialog');
    self.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_project');
    self.waitUntilVisible('.alert-success');
    self.waitWhileVisible('.alert-success');
  });
});

casper.run(function() {
  if (javascript_errors.length > 0) {
    this.echo(javascript_errors.length + ' Javascript errors found', "WARNING");
  } else {
    this.echo(javascript_errors.length + ' Javascript errors found', "INFO");
  }
  casper.exit();
});

