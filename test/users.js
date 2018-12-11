casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.start();

var verbose = false;
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
    this.capture('images/users_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/users_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message);});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'bad'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});
casper.waitForSelector('div.alert');
casper.then(function(response){
  this.test.assertTextExists('Bad password');
});
casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){
  this.fill('#login_form', {'login':'bad','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});
casper.waitForSelector('div.alert');
casper.then(function(response){
  this.test.assertTextExists('Uknown user');
});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'li a[href$="users/view"]');
casper.thenClick('li a[href$="users/view"]');
casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('User management');
});

// delete the test user if it already exists
// loop over known users to remove them ...
casper.then(function(){
  var user_label = 'toto@free.fr';
  this.evaluate(function(user_label){$('td:contains("' + user_label + '")').closest('tr').find('button:contains("delete")').click();}, user_label);
  this.wait(200);
  this.waitWhileSelector('td:contains("' + user_label + '")');
  this.wait(200);
});


casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.waitUntilVisible('#new_user');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#new_user'); });
casper.then(function(response){
  this.fill('form[name="user"]', {'name':'toto',
                                  'email':'toto@free.fr',
                                  'pwd':'dudule',
                                 });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_user');
casper.thenClick('#add_my_user');
casper.waitWhileVisible('#new_user');
casper.waitUntilVisible('div.alert-success');
casper.waitWhileVisible('div.alert-success');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_user');

// try another time to add the same user with the same email address
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.waitUntilVisible('#new_user');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#new_user'); });
casper.then(function(response){
  this.fill('form[name="user"]', {'name':'toto',
                                  'email':'toto@free.fr',
                                  'pwd':'dudule',
                                 });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_user');
casper.thenClick('#add_my_user');
casper.waitUntilVisible('.alert-danger');
casper.waitWhileVisible('.alert-danger');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#add_my_user');
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#cancel_add_user');
casper.thenClick('#cancel_add_user');

// then we save our current cookie
// try to change from user, check user password
// reset navigator session cookie
casper.then(function(){
   this.page.cookies=[];
});

// check I've lose my rights
// should take a 403 forbidden!
casper.thenOpen('http://127.0.0.1:6543/users/view');
casper.then(function(response){
  this.test.assertTextExists('403 Forbidden');
});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'toto@free.fr','password':'dudule'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertDoesntExist('span[class="glyphicon glyphicon-plus"]');
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#sign_out');
casper.thenClick("#sign_out");
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0');
  this.test.assertTextDoesntExist('Dashboard');
  this.test.assertDoesntExist('span[class="glyphicon glyphicon-plus"]');
});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'li a[href$="users/view"]');
casper.thenClick('li a[href$="users/view"]');

// then we delete the user !
casper.then(function(response){
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'table tr:last-child button:last-child');
  this.evaluate(function(){$('table tr:last-child button:last-child').click();});
});
casper.wait(1000);
casper.then(function(response){
  this.test.assertTextDoesntExist('toto@free.fr');
});

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#sign_out');
casper.thenClick("#sign_out");

// check I've loos my rights
// should take a 403 forbidden!
casper.thenOpen('http://127.0.0.1:6543/users/view');
casper.then(function(response){
  this.test.assertEqual(response.status,403);
  this.test.assertTextExists('403 Forbidden');
});

casper.run();
