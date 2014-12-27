var child_process = require("child_process");
var spawn = child_process.spawn;
var execFile = child_process.execFile;
var fs = require('fs');
var local_path = fs.workingDirectory; 
var map_project_to_url = {};
var lst_projects_labels = ['d1', 'd2']

casper.spawn = function(){
  var command = arguments[0];
  var _arguments = [];
  for (i = 1; i < arguments.length; i++) { 
      _arguments.push(arguments[i]);
  }
  var child = spawn(command, _arguments, null);
  child.stdout.on("data", function (data) {
    console.log("spawn STDOUT:", JSON.stringify(data));
  });
  child.stderr.on("data", function (data) {
    console.log("spawn STDERR:", JSON.stringify(data));
  });
  child.on("exit", function (code) {
    console.log("spawn EXIT:", code);
  });
};

casper.hg = function(){
  var _arguments = [];
  for (i = 0; i < arguments.length; i++) { 
      _arguments.push(arguments[i]);
  }
  var child = execFile("./wrap_mercurial.sh", _arguments, null, function (err, stdout, stderr) {
    console.log("hg ERR    :", JSON.stringify(err));
    console.log("hg STDOUT :", JSON.stringify(stdout));
    console.log("hg STDERR :", JSON.stringify(stderr));
  });
  // If you need to log child ...
  // require('utils').dump(child);
  this.wait(300);
};

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
    this.capture('images/repositories_hg_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});

casper.on('step.error', function(error){
  if(!casper.cli.has('fast')){
    this.capture('images/repositories_hg_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
  }
});

casper.on('remote.message',function(message){this.echo(message);});

casper.then(function(){
  this.spawn("rm", "-rf", "./repositories");
});

casper.then(function(){
  this.spawn("mkdir","./repositories");
  this.hg("init", "./repositories/d1");
});

// we clone the empty repo
casper.then(function(){
  this.hg("clone", "./repositories/d1", "./repositories/d2");
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
  var projects_urls = this.evaluate(function(lst_projects_labels) {
      return $('#projects_list .project_link').map(function(id,item){
        if(lst_projects_labels.indexOf($(item).text())!==-1){
          return $(item).attr('href');
        }
      }).toArray();
  }, lst_projects_labels );
 //require('utils').dump(projects_urls);
 this.each(projects_urls, function(self, next_link){
    self.click('form[name="view_project"] button.dropdown-toggle');
    self.thenOpen(next_link);
    self.waitUntilVisible('#project_home');
    self.thenClick('#manage_project');
    self.thenClick('#view_delete_project');
    self.waitUntilVisible('form[name="view_project"] button.dropdown-toggle');
    self.wait(200);
 });

});

casper.then(function(){
  var projects_urls = this.evaluate(function(lst_projects_labels) {
      return $('#projects_list .project_link').map(function(id,item){
        if(lst_projects_labels.indexOf($(item).text())!==-1){
          return $(item).attr('href');
        }
      }).toArray();
  }, lst_projects_labels );
  casper.test.assertEquals(projects_urls.length, 0);
});

casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]',
    function(){this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.then(function(){
 this.each(lst_projects_labels, function(self, project_id){
    // add a new project
    self.thenClick('span[class="glyphicon glyphicon-plus"]');
    self.then(function(response){ this.test.assertExists('#add_my_project'); });
    self.then(function(response){
      this.fill('form[name="project"]', { 'name':project_id,
                                          'host':'127.0.0.1',
                                          'path': local_path + '/repositories/' +project_id,
                                          'user':'sbard',
                                          'password':'evangelion' });
    });
    self.thenClick('#add_my_project');
    self.waitWhileVisible('#new_project_dialog');
    self.waitUntilVisible('.alert-success');
    self.waitWhileVisible('.alert-success');
  });
});

casper.then(function(){
  var projects_urls = this.evaluate(function() {
      return $('#projects_list .project_link').map(function(id,item){return [[$(item).text(),$(item).attr('href')]];}).toArray();
  });

  for (var i = 0; i < projects_urls.length; i++) {
    map_project_to_url[projects_urls[i][0]] = projects_urls[i][1];
  }
});

casper.then(function(){
  fs.write('./repositories/d1/README.txt','PROJECT DESCRIPTION FILE \n HELLO WORLD !','w');
});

casper.then(function(){
  this.hg("add", "./repositories/d1/README.txt", "-R", "./repositories/d1/");
});

casper.then(function(){
  this.hg("ci", "-m", 'my_first_commit', "-R", "./repositories/d1/", "-u", "stephane.bard@gmail.com");
});

casper.then(function(){
  this.open(map_project_to_url.d1);
});

casper.waitUntilVisible('#project_home');
casper.thenClick('a[href="#related"]');
casper.thenClick('#other_projects a:first-child');
casper.waitForSelector('#button_push');
casper.thenClick('#button_push');

casper.waitUntilVisible('#container_alert .progress-bar', function(){
  this.test.assertExists('#container_alert .progress-bar');
});

casper.waitWhileVisible('#container_alert .progress-bar', function(){
  this.test.assertDoesntExist('#container_alert .progress-bar');
  this.test.assertNotVisible('#button_push');
});

casper.then(function(){
  this.open(map_project_to_url.d2);
});

casper.waitUntilVisible('#project_home', function(){
  this.test.assertDoesntExist('.glyphicon-ok');
  this.test.assertTextExists('my_first_commit');
});
casper.thenClick('#revision_table tbody tr td:nth-child(2) a');
casper.waitUntilVisible('#confirm_move_dialog');
casper.thenClick('#move_to');

casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('my_first_commit');
  var link_str = this.evaluate(function(){ return $('#revision_table > tbody > tr > td:nth-child(7) > a').text(); });
  this.test.assertEquals(link_str, 'my_first_commit');
});

// click on revision link
casper.thenClick('#revision_table > tbody > tr > td:nth-child(7) > a');
casper.waitUntilVisible('#files_panel');

casper.then(function(){
  var tab_str = this.evaluate(function(){ return $('#project_tab li.active > a').text(); });
  this.test.assertEquals(tab_str, "Revision");
});

casper.waitForSelector('div.source > pre');

casper.thenClick('#files a');
casper.wait(300);

casper.then(function(){
  fs.write('./repositories/d2/README.txt','PROJECT DESCRIPTION FILE \n HELLO WORLD !\n FROM d2 repositories. it rocks','w');
});
casper.then(function(){
  this.hg("ci", "-m", 'second_commit_d2', "-R", "./repositories/d2/", "-u", "stephane.bard@gmail.com");
});

casper.reload();
casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('second_commit_d2');
});
casper.then(function(){
  this.open(map_project_to_url.d1);
});
casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextDoesntExist('second_commit_d2');
});

casper.thenClick('a[href="#related"]');
casper.thenClick('#other_projects a:first-child');
casper.waitForSelector('#button_pull');
casper.thenClick('#button_pull');

casper.waitUntilVisible('#container_alert .progress-bar', function(){
  this.test.assertExists('#container_alert .progress-bar');
});

casper.waitWhileVisible('#container_alert .progress-bar', function(){
  this.test.assertDoesntExist('#container_alert .progress-bar');
  this.test.assertNotVisible('#button_push');
});

casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('second_commit_d2');
});

casper.thenClick('#revision_table tbody tr:nth-child(1) td:nth-child(2) a');
casper.waitUntilVisible('#confirm_move_dialog', function(){
  this.test.assertTextExists('from 0 to 1 revision');
});
casper.thenClick('#move_to');
casper.waitWhileVisible('#confirm_move_dialog');
casper.waitUntilVisible('#project_home');

// finish by logout
casper.thenClick("#sign_out");

casper.run();