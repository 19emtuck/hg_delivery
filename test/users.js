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
    this.capture('images/users_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/users_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
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

casper.thenClick('li a[href$="users"]');
casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0');
  this.test.assertTextExists('User management');
});
casper.then(function(response){ this.click('span[class="glyphicon glyphicon-plus"]') });
casper.waitUntilVisible('#new_user');
casper.then(function(response){ this.test.assertExists('#new_user'); });
casper.then(function(response){
  this.fill('form[name="user"]', {'name':'toto',
                                  'email':'toto@free.fr',
                                  'password':'dudule',
                                 });
});
casper.then(function(response){ this.click('#add_my_user') });
casper.waitWhileVisible('#new_user');
casper.waitUntilVisible('div.alert-success');
casper.waitWhileVisible('div.alert-success');

// try another time to add the same user with the same email address
casper.then(function(response){ this.click('span[class="glyphicon glyphicon-plus"]') });
casper.waitUntilVisible('#new_user');
casper.then(function(response){ this.test.assertExists('#new_user'); });
casper.then(function(response){
  this.fill('form[name="user"]', {'name':'toto',
                                  'email':'toto@free.fr',
                                  'password':'dudule',
                                 });
});
casper.then(function(response){ this.click('#add_my_user') });
casper.waitUntilVisible('.alert-danger');
casper.waitWhileVisible('.alert-danger');
casper.then(function(response){ this.click('#cancel_add_user') });

// then we delete the user !
casper.then(function(response){
  this.evaluate(function(){$('table tr:last-child button:last-child').click()});
});
casper.wait(1000);
casper.then(function(response){
  this.test.assertTextDoesntExist('toto@free.fr');
});


casper.run();
