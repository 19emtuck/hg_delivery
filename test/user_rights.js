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
    this.capture('images/users_rights_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/users_rights_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message);});


// check some user exist
// change from role change it's credentials on a project
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

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'li a[href$="users/view"]');
casper.thenClick('li a[href$="users/view"]');
casper.then(function(){
  this.test.assertTextExists('tata@free.fr');
});

casper.then(function(response){this.test.assertTextExists('d1');});
casper.then(function(){
  var next_link = this.evaluate(function(){
     return $('#projects_list a:contains("d1")').attr('href');
  });
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#projects_list a:contains("d1")');
  this.thenOpen(next_link);
});

casper.then(function(){
  this.clickLabel("Users (rights management)");
});

casper.thenOpen('http://127.0.0.1:6543/users/view');
casper.waitForSelector('#save_users_acl');

casper.thenEvaluate(function(){
  $('.ace').val('edit');
});
casper.thenClick('#save_users_acl');

casper.then(function(){
  var next_link = this.evaluate(function(){
     return $('#projects_list a:contains("d1")').attr('href');
  });
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#projects_list a:contains("d1")');
  this.thenOpen(next_link);
});

casper.then(function(){
  this.clickLabel("Users (rights management)");
});
casper.then(function(){
  var lst_vals = this.evaluate(function(){
    return $('form[name="project_acls"] select').map(function(_id,_item){return $(_item).val();}).toArray();
  });
  this.test.assertEquals('editeditedit',lst_vals.join(''));
});

casper.thenOpen('http://127.0.0.1:6543/users/view');
casper.waitForSelector('#save_users_acl');

casper.thenEvaluate(function(){
  $('.ace').val('');
});
casper.thenClick('#save_users_acl');
casper.then(function(){
  var next_link = this.evaluate(function(){
     return $('#projects_list a:contains("d1")').attr('href');
  });
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#projects_list a:contains("d1")');
  this.thenOpen(next_link);
});

casper.then(function(){
  this.clickLabel("Users (rights management)");
});
casper.then(function(){
  var lst_vals = this.evaluate(function(){
    return $('form[name="project_acls"] select').map(function(_id,_item){return $(_item).val();}).toArray();
  });
  this.test.assertEquals('',lst_vals.join(''));
});

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#sign_out');
casper.thenClick("#sign_out");

casper.run();
