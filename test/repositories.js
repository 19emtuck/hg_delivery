var MACROS = require('./utils/macros');

/**
 * This casperjs/phantomjs test is about
 * repositories relationship.
 *
 * We're going to create new real repository
 * and clone it to follow differences
 *
 **/

if(!casper.cli.has("login")){
  casper.echo('please provide --login=xxxx argument', "ERROR");
  casper.exit();
}
if(!casper.cli.has("password")){
  casper.echo('please provide --password=xxxx argument', "ERROR");
  casper.exit();
}

var child_process       = require("child_process");
var spawn               = child_process.spawn;
var execFile            = child_process.execFile;
var fs                  = require('fs');
var local_path          = fs.workingDirectory;
var map_project_to_url  = {};
var lst_projects_labels = ['d1', 'd2', 'd3','d5','d6'];

var login               = casper.cli.get("login");
var password            = casper.cli.get("password");

var verbose = false;
if(casper.cli.has('verbose')){
  verbose = true;
}

casper.options.logLevel = 'debug';
casper.options.verbose = verbose;
casper.options.waitTimeout = 9000;

casper.spawn = function(){
  var command = arguments[0];
  var _arguments = [];
  for (i = 1; i < arguments.length; i++) { 
      _arguments.push(arguments[i]);
  }
  var child = spawn(command, _arguments, null);
  child.stdout.on("data", function (data) {
    if(data){
      console.log("spawn STDOUT:", JSON.stringify(data));
    }
  });
  child.stderr.on("data", function (data) {
    if(data){
      console.log("spawn STDERR:", JSON.stringify(data));
    }
  });
  child.on("exit", function (code) {
    if(code){
      console.log("spawn EXIT:", code);
    }
  });
  this.wait(600);
};

casper.hg = function(){
  var _arguments = [];
  for (i = 0; i < arguments.length; i++) { 
      _arguments.push(arguments[i]);
  }
  var child = execFile("./wrap_mercurial.sh", _arguments, null, function (err, stdout, stderr) {
    if(err){
      console.log("hg ERR    :", JSON.stringify(err));
    }
    if(stdout){
      console.log("hg STDOUT :", JSON.stringify(stdout));
    }
    if(stderr){
      console.log("hg STDERR :", JSON.stringify(stderr));
    }
  });
  // If you need to log child ...
  // require('utils').dump(child);
  this.wait(300);
};

var click_on_row_col = function(row, col){
  var e = document.createEvent('UIEvents');
  e.initUIEvent('click', true, true);
  $($('#d3_container ul').get(row)).find('li:nth-child('+col+') a').get(0).dispatchEvent(e);
};
var css_on_row_col = function(row, col, css_attr, css_value){
  $($('#d3_container ul').get(row)).find('li:nth-child('+col+')').css(css_attr, css_value);
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
  this.capture('images/repositories_hg_'+casper.step+'.jpg', undefined,{ format:'jpg', quality:100});
});

casper.on('remote.message',function(message){this.echo(message);});

casper.then(function(){
  this.spawn("rm", "-rf", "./repositories");
});

casper.then(function(){
  this.spawn("mkdir","./repositories");
  this.hg("init", "./repositories/d1");
});

casper.then(function(){
  var f = fs.open('./repositories/d1/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nHELLO WORLD !');
  f.close();
});

casper.then(function(){
  this.hg("add", "./repositories/d1/README.txt", "-R", "./repositories/d1/");
});

casper.then(function(){
  this.hg("ci", "-m", 'initial_commit', "-R", "./repositories/d1/", "-u", "stephane.bard@gmail.com");
});

// we clone the empty repo
casper.then(function(){
  this.hg("clone", "./repositories/d1", "./repositories/d2");
  this.hg("clone", "./repositories/d1", "./repositories/d3");
  this.hg("clone", "./repositories/d1", "./repositories/d5");
  this.hg("clone", "./repositories/d1", "./repositories/d6");
});

casper.thenOpen('http://127.0.0.1:6543');
casper.then(function(response){ this.test.assertTitle('Hg Delivery 1.0'); });
casper.then(function(response){
  this.fill('#login_form', {'login':'editor','password':'editor'});
  this.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#log_me');
  this.click('#log_me');
});
casper.then(function(response){
  this.test.assertTitle('Hg Delivery 1.0 welcome :)');
  this.test.assertTextExists('Dashboard');
  this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});


MACROS.detach_all_projects_from_their_group(casper);
MACROS.remove_all_projects(casper);

casper.waitUntilVisible('span[class="glyphicon glyphicon-plus"]',
    function(){this.test.assertExists('span[class="glyphicon glyphicon-plus"]');
});

casper.then(function(){
 this.each(lst_projects_labels, function(self, project_id){
    // add a new project
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
    self.thenClick('span[class="glyphicon glyphicon-plus"]');
    self.then(function(response){ this.test.assertExists('#add_my_project'); });
    self.then(function(response){
      this.fill('form[name="project_add"]', { 'name'     : project_id,
                                              'host'     : '127.0.0.1',
                                              'path'     : local_path + '/repositories/' +project_id,
                                              'user'     : login,
                                              'password' : password });
    });
    self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_project');
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
  var f = fs.open('./repositories/d1/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nAFTER INIT');
  f.close();
  this.wait(100);
});

casper.then(function(){
  this.hg("ci", "-m", 'my_first_commit', "-R", "./repositories/d1/", "-u", "stephane.bard@gmail.com");
});

casper.then(function(){
  this.open(map_project_to_url.d1);
});

casper.waitUntilVisible('#project_home');
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'a[href="#related"]');
casper.thenClick('a[href="#related"]');
casper.waitForSelector('#other_projects a[data-name="d2"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, 'a[href="#related"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#other_projects a[data-name="d2"]');
casper.thenClick('#other_projects a[data-name="d2"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#other_projects a[data-name="d2"]');
casper.waitUntilVisible('#button_push');
casper.waitFor(function check(){
  return this.evaluate(function(){
    return typeof($('#button_push').attr('disabled'))==='undefined';
  });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#button_push');
casper.thenClick('#button_push');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#button_push');

casper.waitUntilVisible('#container_alert .progress-bar', function(){
  this.test.assertExists('#container_alert .progress-bar');
});

casper.waitWhileVisible('#container_alert .progress-bar', function(){
  this.test.assertDoesntExist('#container_alert .progress-bar');
});

casper.then(function(){
  var project_pushed_name = this.evaluate(function(){return $('#other_projects a[data-name="d2"]').data('name');});
  // get project where I pushed ...
  this.thenOpen(map_project_to_url[project_pushed_name]);
});

casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('my_first_commit');
});
casper.thenEvaluate(css_on_row_col, 1, 2, 'border', 'solid red 1px');
casper.thenEvaluate(css_on_row_col, 1, 2, 'color', 'green');
casper.thenEvaluate(click_on_row_col, 1, 2);
casper.waitUntilVisible('#confirm_move_dialog');
casper.thenClick('#move_to');
casper.waitForResource('project\/update');

casper.waitUntilVisible('#project_home');
casper.wait(1000);
casper.waitUntilVisible('.glyphicon-ok', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('my_first_commit');
  var link_str = this.evaluate(function(){ return $($('#d3_container ul').get(1)).find('li:nth-child(7) a').text();});
  this.test.assertEquals(link_str, 'my_first_commit');
});

// click on revision link
casper.thenEvaluate(css_on_row_col, 1, 7, 'border', 'solid red 1px');
casper.thenEvaluate(css_on_row_col, 1, 7, 'color', 'green');
casper.thenEvaluate(click_on_row_col, 1, 7);
casper.waitUntilVisible('#files_panel');

casper.then(function(){
  var tab_str = this.evaluate(function(){ return $('#project_tab li.active > a').text(); });
  this.test.assertEquals(tab_str, "Revision");
});

casper.waitForSelector('div.source > pre');

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#files a');
casper.thenClick('#files a');
casper.wait(300);

casper.then(function(){
  var f = fs.open('./repositories/d2/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nHELLO WORLD !\nFROM d2 repositories. it rocks\nYes it is');
  f.close();
  this.wait(100);
});

casper.then(function(){
  this.hg("ci", "-m", 'second_commit_d2', "-R", "./repositories/d2/", "-u", "stephane.bard@gmail.com");
});
// we shall wait a bit to be sure 
casper.wait(300);

casper.reload();
casper.waitForText('second_commit_d2');
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

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'a[href="#related"]');
casper.thenClick('a[href="#related"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#other_projects a[data-name="d2"]');
casper.thenClick('#other_projects a[data-name="d2"]');
casper.thenEvaluate(function(selector){ $(selector).css('border','').css('color',''); }, '#other_projects a[data-name="d2"]');
casper.waitUntilVisible('#button_pull');
casper.waitFor(function check(){
  return this.evaluate(function(){
    return typeof($('#button_pull').attr('disabled'))==='undefined';
  });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#button_pull');
casper.thenClick('#button_pull');

casper.waitUntilVisible('#container_alert .progress-bar', function(){
  this.test.assertExists('#container_alert .progress-bar');
});

casper.waitWhileVisible('#container_alert .progress-bar', function(){
  this.test.assertDoesntExist('#container_alert .progress-bar');
});

casper.waitUntilVisible('#project_home', function(){
  this.test.assertExists('.glyphicon-ok');
  this.test.assertTextExists('second_commit_d2');
});

casper.then(function(){
  this.test.assertDoesntExist('.glyphicon-pushpin');
});
casper.then(function(){
  this.spawn("chmod", "500", "./repositories/d1");
});
// we click on the first release line to update repo to
// the last release
casper.thenEvaluate(css_on_row_col, 1, 2, 'border-color', 'red');
casper.thenEvaluate(css_on_row_col, 1, 2, 'color', 'green');
casper.thenEvaluate(click_on_row_col, 1, 2);
casper.waitUntilVisible('#confirm_move_dialog', function(){
  this.test.assertTextExists('from 1 to 2 revision');
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#move_to');
casper.thenClick('#move_to');
casper.waitWhileVisible('#confirm_move_dialog');
casper.waitForText('Project d1 has not been updated :( please check permission and or check local update with hg command');
casper.wait(100);
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#alert button.close');
casper.thenClick('.alert button.close');
casper.then(function(){
  this.spawn("chmod", "755", "./repositories/d1");
});

// we click on the first release line to update repo to
// the last release
casper.thenEvaluate(css_on_row_col, 1, 2, 'border-color', 'red');
casper.thenEvaluate(css_on_row_col, 1, 2, 'color', 'green');
casper.thenEvaluate(click_on_row_col, 1, 2);
casper.waitUntilVisible('#confirm_move_dialog', function(){
  this.test.assertTextExists('from 1 to 2 revision');
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#move_to');
casper.thenClick('#move_to');
casper.waitWhileVisible('#confirm_move_dialog');
casper.waitForText('Project d1 has been updated successfully');
casper.wait(100);
casper.waitWhileVisible('.alert');
casper.then(function(){
  // after update a new pushpin icon appear which gives update dates to user
  this.test.assertExists('.glyphicon-pushpin');
});

// now both commits separatly 
// but on different branch
casper.then(function(){
  var f = fs.open('./repositories/d1/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nHELLO WORLD !\nFROM d2 repositories. it rocks\nThis is pretty awesome');
  f.close();
  this.hg("branch", "brch_1", "-R", "./repositories/d1/");
});
casper.then(function(){
  this.hg("ci", "-m", 'third_commit_d1', "-R", "./repositories/d1/", "-u", "stephane.bard@gmail.com");
});

casper.then(function(){
  var f = fs.open('./repositories/d2/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nHELLO WORLD !\nFROM d2 repositories. it rocks\nAre you sure ?');
  f.close();
});
casper.then(function(){
  this.hg("ci", "-m", 'third_commit_d2', "-R", "./repositories/d2/", "-u", "stephane.bard@gmail.com");
});

casper.thenOpen('http://127.0.0.1:6543');
// create an non linked repositories to check he correctly linked to nowhere
casper.then(function(){
  this.spawn("mkdir","./repositories");
  this.hg("init", "./repositories/d4");
});
casper.then(function(){
  var f = fs.open('./repositories/d4/README.txt','w');
  f.write('PROJECT DESCRIPTION FILE\nHELLO WORLD !');
  f.close();
});
casper.then(function(){
  this.hg("add", "./repositories/d4/README.txt", "-R", "./repositories/d4/");
});
casper.then(function(){
  this.hg("ci", "-m", 'initial_commit', "-R", "./repositories/d4/", "-u", "stephane.bard@gmail.com");
});

// add a new project
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'span[class="glyphicon glyphicon-plus"]');
casper.thenClick('span[class="glyphicon glyphicon-plus"]');
casper.then(function(response){ this.test.assertExists('#add_my_project'); });
casper.then(function(response){
  this.fill('form[name="project_add"]', { 'name'     : 'd4',
                                          'host'     : '127.0.0.1',
                                          'path'     : local_path + '/repositories/d4',
                                          'user'     : login,
                                          'password' : password });
});
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#add_my_project');
casper.thenClick('#add_my_project');
casper.waitWhileVisible('#new_project_dialog');
casper.waitUntilVisible('.alert-success');
casper.waitWhileVisible('.alert-success');

casper.then(function(){
  var projects_urls = this.evaluate(function() {
      return $('#projects_list .project_link').map(function(id,item){return [[$(item).text(),$(item).attr('href')]];}).toArray();
  });

  for (var i = 0; i < projects_urls.length; i++) {
    map_project_to_url[projects_urls[i][0]] = projects_urls[i][1];
  }
});

casper.then(function(){
  this.open(map_project_to_url.d4);
});

casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'a[href="#related"]');
casper.thenClick('a[href="#related"]');
casper.then(function(){
  this.test.assertTextExists('No linked project detected');
});

// finish by logout
casper.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#sign_out');
casper.thenClick("#sign_out");

casper.run();
