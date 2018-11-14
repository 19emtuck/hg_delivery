var javascript_errors  = [];
var map_project_to_url = {};
var local_path         = fs.workingDirectory;
var new_task_id        = null;

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
    this.capture('images/macros_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});

casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/macros_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
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
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#login_form button');
  this.thenClick('#login_form button');
});

casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});


// select d1 project (this test depends on repositories.s)
casper.then(function(){
  var projects_urls = this.evaluate(function(lst_projects_labels) {
      return $('#projects_list .project_link').map(function(id,item){
        if(lst_projects_labels.indexOf($(item).text())!==-1){
          return window.location.origin + $(item).attr('href');
        }
      }).toArray();
  }, ['d1']);

  var next_link = projects_urls[0];

  // require('utils').dump(projects_urls);

  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'form[name="view_project"] button.dropdown-toggle');
  this.thenClick('form[name="view_project"] button.dropdown-toggle');
  this.thenOpen(next_link);
  this.waitUntilVisible('#project_home');
});

casper.waitForText('Macros');

// delete existing macros if needed
casper.then(function(){
 var lst_macro_id = this.evaluate(function() {
   return $('span[data-macro_id]').map(function(id,item){return $(item).data('macro_id');}).toArray();
 });
 this.each(lst_macro_id, function(self, macro_id){
    self.thenClick('button[data-macro_id="'+macro_id+'"][onclick^="delete"]');
    self.then(function(){
      this.waitWhileVisible('button[data-macro_id="'+macro_id+'"][onclick^="delete"]');
    });
 });
});

casper.thenClick('a[href="#macros"]');
casper.then(function(){ this.click('div.tab-pane.active a'); });
casper.waitUntilVisible('#new_macro_dialog', function(){
  this.test.assertExists('input[name="macro_name"]');
  this.test.assertExists('select[name^="direction_"]');
});

casper.thenEvaluate(function(){ $('input[name="macro_name"]').val('TEST MACRO'); });
casper.thenEvaluate(function(){ $('select[name^="direction_"]').val('push'); });
casper.thenClick('#button_add_macro');
casper.waitWhileVisible('#new_macro_dialog');
casper.wait(100)
casper.then(function(){
  this.test.assertTextExists('Your macro has been recorded');
  this.test.assertTextExists('TEST MACRO');
  this.test.assertTextExists('that imply : push');
  this.test.assertExists('.alert-success');
});
casper.waitWhileVisible('.alert-success');

casper.thenClick('#macros_list li button:last-child');
casper.waitForText('runing ...');

// wait outstanding ajax call
casper.waitFor(function(){
  var outstandingAjaxRequests = casper.evaluate(function(){ return $.active; });
  return (outstandingAjaxRequests == 0);
}, function(){}, function() {
  this.test.fail("Timed out waiting for ajax calls to complete", "ERROR");
}, 15000);

casper.wait(200);
casper.thenBypassIf(function(){ return !this.visible('#new_branch'); },2);
casper.thenClick('#new_branch');
casper.waitWhileVisible('#dismiss_force_push_dialog');

casper.waitForText('run it');
casper.wait(1000);
casper.waitUntilVisible('.alert-success');
casper.waitWhileVisible('.alert-success');


// check if we can change it ...
casper.thenClick('button.btn[onclick^="edit_a_macro"]');
casper.waitForText('Edit this macro');
casper.thenEvaluate(function(){ $('#update_macro_dialog select[name^="direction_"]').first().val(''); });
casper.wait(100);
casper.thenClick('#button_update_macro');
casper.waitForSelectorTextChange('#macros_list li span.macro_content');
casper.wait(100);

// delete last macros ...
casper.thenClick('button.btn[onclick^="delete_this_macro"]');

// wait until macros list will get empty
casper.waitFor(function(){ return this.evaluate(function(){ return $('#macros_list li').size(); }) === 0; });
casper.wait(100);

casper.run(function() {
  if (javascript_errors.length > 0) {
    this.echo(javascript_errors.length + ' Javascript errors found', "WARNING");
  } else {
    this.echo(javascript_errors.length + ' Javascript errors found', "INFO");
  }
  casper.exit();
});


