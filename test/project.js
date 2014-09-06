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
    this.capture('images/projects_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/projects_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message)});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.click('#log_me')
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

// add a new project
casper.then(function(response){ this.click('span[class="glyphicon glyphicon-plus"]') });
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.then(function(response){
  this.fill('form[name="project"]', {'name':'t8',
                   'host':'127.0.0.1',
                   'path':'/home/sbard/dev/t8',
                         'user':'sbard',
                         'password':'evangelion',
                        });
});
casper.thenClick('#add_my_project');
casper.waitWhileVisible('#new_project_dialog');
casper.waitUntilVisible('.alert-success');

// try to add the same project twice !
casper.then(function(response){ this.click('span[class="glyphicon glyphicon-plus"]') });
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.then(function(response){
  this.fill('form[name="project"]', {'name':'t8',
                   'host':'127.0.0.1',
                   'path':'/home/sbard/dev/t8',
                         'user':'sbard',
                         'password':'evangelion',
                        });
});
casper.thenClick('#add_my_project');
casper.waitUntilVisible('.alert-danger');
casper.thenClick("#cancel_add_project");
casper.waitWhileVisible('#new_project_dialog');

// then we delete the project
casper.thenClick('form[name="view_project"] button.dropdown-toggle');
casper.then(function(response){this.test.assertTextExists('t8');});
casper.then(function(){
  var next_link = this.evaluate(function(){
     return $('#projects_list a:contains("t8")').attr('href');
  });
  this.thenOpen(next_link);
})
casper.waitUntilVisible('#project_home');
casper.thenClick('#manage_project');
casper.thenClick('#view_delete_project');

// back to welcome page ...
casper.waitWhileVisible('span[class="glyphicon glyphicon-plus"]');

casper.run();
