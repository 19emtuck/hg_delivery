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
    this.capture('images/login_logout_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/login_logout_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message)});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0');
});
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

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#sign_out');
casper.thenClick("#sign_out");

// check I lost my rights and be really disconnected
// should take a 403 forbidden!
casper.thenOpen('http://127.0.0.1:6543/users/view');
casper.then(function(response){
  this.test.assertEqual(response.status,403);
  this.test.assertTextExists('403 Forbidden');
});
casper.run();
