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
    this.capture('images/init_some_users_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/init_some_users_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message)});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#log_me');
  this.thenClick('#log_me')
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.thenClick('li a[href$="users/view"]');
casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('User management');
});

// loop over known users to remove them ...
casper.then(function(){
  known_users = this.evaluate(function() {
    return $('#users_overview tbody tr td:nth-child(2)').map(function(id,item){return $(item).text();}).toArray();
  });
  this.each(known_users, function(self, user_label){
    self.evaluate(function(user_label){$('td:contains("' + user_label + '")').closest('tr').find('button:contains("delete")').click();}, user_label);
    self.wait(200);
    self.waitWhileSelector('td:contains("' + user_label + '")');
    self.wait(200);
  });
});

// loop over users to add them ...
casper.then(function(){
  var list_users=[  {'name':'toto', 'email':'toto@free.fr', 'pwd':'dudule'},
                    {'name':'titi', 'email':'titi@free.fr', 'pwd':'dudule'},
                    {'name':'tata', 'email':'tata@free.fr', 'pwd':'dudule'} ];

  this.each(list_users, function(self, user_info){
    self.click('span[class="glyphicon glyphicon-plus"]');
    self.wait(200);
    self.waitForSelector('#add_my_user');
    self.fill('form[name="user"]', user_info);
    self.click('#add_my_user');
    self.wait(200);
    self.waitWhileVisible('#add_my_user');
    self.waitForText(user_info.email);
    self.waitWhileVisible('div.alert-success');
    self.wait(200);
  });

});

casper.thenClick("#sign_out");
casper.run();
