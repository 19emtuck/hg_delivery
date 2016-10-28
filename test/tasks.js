var MACROS = require('./utils/macros');

var javascript_errors  = [];
var map_project_to_url = {};
var local_path         = fs.workingDirectory;
var login              = casper.cli.get("login");
var password           = casper.cli.get("password");
var new_task_id        = null;
var bad_task_id        = null;
var bad_return_task_id = null;

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
    this.capture('images/tasks_test_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});

casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/tasks_error_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});
casper.on('remote.message',function(message){this.echo(message);});

casper.on("page.error", function(msg, trace) {
  this.echo("-> Error:    " + msg, "ERROR");
  this.echo("-> Trace:    " + trace, "ERROR");
  javascript_errors.push(msg);
});

MACROS.log_me(casper, 'editor', 'editor');

casper.then(function(){
  var projects_urls = this.evaluate(function() {
      return $('#projects_list .project_link').map(function(id,item){return [[$(item).text(),$(item).attr('href')]];}).toArray();
  });

  for (var i = 0; i < projects_urls.length; i++) {
    map_project_to_url[projects_urls[i][0]] = projects_urls[i][1];
  }
});

casper.then(function(){
  this.open(map_project_to_url.d1);
});

casper.thenClick('a[href="#tasks"]');

// loop over tasks to remove them ...
casper.then(function(){
 var tasks = this.evaluate(function() {
   return $('button:contains("delete it")').map(function(id,item){return $(item).data('id');}).toArray();
 });

 this.each(tasks, function(self, next_id){
    self.thenClick('button[data-id="'+next_id+'"]');
    // wait a bit ...
    self.wait(700);
 });
});

// now we will ad tasks that will provide error code or just errors
// to check if we get back errors as well
// sh grumpycommande
casper.then(function(){ this.clickLabel('add a task'); });
casper.then(function(){
  this.test.assertExist('input[name="task_content"]');
  this.test.assertVisible('input[name="task_content"]');
});
casper.then(function(){
  this.fill('form[name="project_tasks"]',{'task_content':'sh grumpycommande'});
});
casper.thenClick('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');
casper.wait(500);
casper.waitForText('run it ..');
casper.then(function(){ 
  bad_task_id = this.evaluate(function(){return $('button:contains("run it ..")').last().data('id');});
});
casper.then(function(){
  this.click('button[data-id="'+bad_task_id+'"].run_task');
});
casper.waitForText('runing ...');
casper.waitForText('run it ..');
casper.waitForSelector('.alert.alert-danger');
casper.thenClick('div.alert button.close');
casper.waitWhileVisible('.alert.alert-danger');
casper.then(function(){
  this.test.assertExists('button[data-id="'+bad_task_id+'"].delete');
  this.click('button[data-id="'+bad_task_id+'"].delete');
});
casper.wait(500);
casper.then(function(){
  this.test.assertDoesntExist('button[data-id="'+bad_task_id+'"].delete');
});

// add a simple exit 2 task to check error command
casper.then(function(){ this.clickLabel('add a task'); });
casper.then(function(){
  this.test.assertExist('input[name="task_content"]');
  this.test.assertVisible('input[name="task_content"]');
});
casper.then(function(){
  this.fill('form[name="project_tasks"]',{'task_content':'exit 2'});
});
casper.thenClick('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');
casper.wait(500);
casper.waitForText('run it ..');
casper.then(function(){ 
  bad_return_task_id = this.evaluate(function(){return $('button:contains("run it ..")').last().data('id');});
});
casper.then(function(){
  this.click('button[data-id="'+bad_return_task_id+'"].run_task');
});
casper.waitForText('runing ...');
casper.waitForText('run it ..');
casper.waitUntilVisible('div.alert', function(){
  this.test.assertExist('div.alert-danger');
});
casper.thenClick('div.alert button.close');
casper.waitWhileVisible('.alert.alert-danger');
casper.then(function(){
  this.click('button[data-id="'+bad_return_task_id+'"].delete');
});
casper.waitWhileVisible('button[data-id="'+bad_return_task_id+'"]');
casper.wait(500);

// add a simple ls -al task
casper.then(function(){
  this.clickLabel('add a task');
});
casper.then(function(){
  this.test.assertExist('input[name="task_content"]');
  this.test.assertVisible('input[name="task_content"]');
});
casper.then(function(){
  this.fill('form[name="project_tasks"]',{'task_content':'ls -al'});
});
casper.thenClick('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');
casper.waitForSelectorTextChange('#save_tasks');

casper.waitForText('run it ..');
casper.then(function(){
  new_task_id = this.evaluate(function(){return $('button:contains("run it ..")').data('id');});
  this.clickLabel('run it ..');
});

casper.waitForText('runing ...');
casper.waitForText('run it ..');

casper.thenClick('#button_log');
casper.waitUntilVisible('#container_logs button.close');
casper.then(function(){
  this.test.assertExist('#button_log');
  this.test.assertExist('#container_logs button.close');
  this.test.assertEquals('ls -al',this.evaluate(function(){return $('.row_log:first li:last').text();}));
});
casper.thenClick('#container_logs button.close');
casper.waitWhileVisible('#container_logs button.close');

casper.then(function(){
  this.test.assertNotVisible('#container_logs button.close');
});




casper.then(function(){ this.clickLabel('Tasks'); });
casper.wait(200);
casper.then(function(){
  this.test.assertTextExists("Project : d1");
  this.test.assertExists('button[data-id="'+new_task_id+'"]');
});
casper.back();
casper.thenClick('a[href="#tasks"]');

casper.then(function(){
  this.clickLabel('delete it ..');
});
casper.waitWhileVisible('input[name="task_content"]');

casper.then(function(){
  this.clickLabel('Tasks');
});

casper.wait(200);

casper.then(function(){
  this.test.assertTextDoesntExist("Project : d1");
  this.test.assertDoesntExist('button[data-id="'+new_task_id+'"]');
});

casper.run(function() {
  if (javascript_errors.length > 0) {
    this.echo(javascript_errors.length + ' Javascript errors found', "WARNING");
  } else {
    this.echo(javascript_errors.length + ' Javascript errors found', "INFO");
  }
  casper.exit();
});

