/**
 * some functions which act as a macros to  */
var require = patchRequire(require);


exports.detach_all_projects_from_their_group = function(casper){
  casper.wait(200);
  // need to detach all projects from groups
  // read group list
  var group_lst_urls = [];
  casper.then(function(){
    group_lst_urls = this.evaluate(function(){
      return $('a.project_link[href*=group]').map(function(_i,_item){ return $(_item).attr('href'); }).toArray();
    });
  });
  casper.then(function(){
    this.each(group_lst_urls, function(self, group_url){
      self.thenOpen(group_url);
      self.then(function(){
        var lst_projects_links = this.evaluate(function(){
          return $('a.list-group-item[href*=edit]').map(function(_i,_item){ return $(_item).attr('href'); }).toArray();
        });
        this.each(lst_projects_links, function(casp, url){
          casp.thenEvaluate(function(url){
            $('a[href="'+url+'"].list-group-item').find('button.close').click();
          }, url);
        });
      });
    });
  });
  casper.wait(200);
};

exports.remove_all_projects = function(capser){
  // loop over projects to remove them ...
  casper.then(function(){
   projects_names = this.evaluate(function() {
     return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
   });
   // require('utils').dump(projects_names);

   this.each(projects_names, function(self, next_link){
      self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, 'form[name="view_project"] button.dropdown-toggle');
      self.thenClick('form[name="view_project"] button.dropdown-toggle');
      self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, "a[href='"+next_link+"']");
      self.thenClick("a[href='"+next_link+"']");
      self.waitUntilVisible('#project_home');
      self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#manage_project');
      self.thenClick('#manage_project');
      self.thenEvaluate(function(selector){ $(selector).css('border','solid 2px red').css('color','red'); }, '#view_delete_project');
      self.thenClick('#view_delete_project');
      self.waitUntilVisible('form[name="view_project"] button.dropdown-toggle');
      // wait a bit ...
      self.wait(700);
   });

  });

  casper.then(function(){
    var projects_names = this.evaluate(function() {
        return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
    });
    casper.test.assertEquals(projects_names.length, 0);
  });
}
