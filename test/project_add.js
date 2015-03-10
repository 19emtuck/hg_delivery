
var javascript_errors = [];
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
  this.click('#log_me');
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
    self.click('form[name="view_project"] button.dropdown-toggle');
    self.thenOpen(next_link);
    self.waitUntilVisible('#project_home');
    self.thenClick('#manage_project');
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
    self.thenClick('span[class="glyphicon glyphicon-plus"]');
    self.then(function(response){ this.test.assertExists('#add_my_project'); });
    self.then(function(response){
      this.fill('form[name="project_add"]', { 'name':project_id,
                                              'host':'127.0.0.1',
                                              'path':'/home/sbard/dev/hg_delivery/test/repositories/'+project_id,
                                              'user':'sbard',
                                              'password':'evangelion' });
    });
    self.thenClick('#add_my_project');
    self.waitWhileVisible('#new_project_dialog');
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

