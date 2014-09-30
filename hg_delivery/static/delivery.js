/*
 * Copyright (C) 2014  Stéphane Bard <stephane.bard@gmail.com>
 * This file is part of hg_delivery
 * 
 * hg_delivery is free software; you can redistribute it and/or modify it under the
 * terms of the M.I.T License.
 *
 */

 
/**
* global jquery init !
*/
$(function() {

  String.prototype.repeat = function( num ) {
    for( var i = 0, buf = ""; i < num; i++ ) {
      buf += this;
    }
    return buf;
  };

  String.prototype.toTitleCase = function () {
      return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };

  String.prototype.ljust = function( width, padding ) {
    var _padding = padding || " ";
    _padding = _padding.substr( 0, 1 );
    if( this.length < width )
      return this + _padding.repeat( width - this.length );
    else
      return this;
  };

  String.prototype.rjust = function( width, padding ) {
    var _padding = padding || " ";
    _padding = _padding.substr( 0, 1 );
    if( this.length < width )
      return _padding.repeat( width - this.length ) + this;
    else
      return this;
  };

});


/**
 * Go to ...
 */
function go_to(url) {
  window.location.href = url;
}

/**
 * update from this project
 */
function push_to(target_project_id, target_url, force_branch){
  if($('#other_projects a.active').length>0){
     var src_project_id = $('#other_projects a.active').data('id');
     $.ajax({url:target_url+src_project_id,
             data:{'force_branch':force_branch},
             beforeSend:function(){
             },
             complete:function(){
             },
             dataType:'json',
             success:function(json_response){
               if(json_response.result){
                 // we just reload the current comparison
                 // get the active link and fetch him twice
                 fetch_this_other_project($('#other_projects a.active')[0]);
               } else if(json_response.new_branch_stop){
                 // dialog : should we force ?
                 if(json_response.lst_new_branches.length>0){
                   $('#confirm_force_push_dialog .modal-body').html("Should we push them ?<br><br>"+json_response.lst_new_branches.join(','));
                 }
                 $('#confirm_force_push_dialog').modal('show');
                 $('#new_branch').off().on('click',function(){ $('#confirm_force_push_dialog').modal('hide'); push_to(target_project_id, target_url, true);});
               }
             },
     });
  }
}

/**
 * update from this project
 */
function pull_from(target_project_id, target_url){
  if($('#other_projects a.active').length>0){
     var src_project_id = $('#other_projects a.active').data('id');
     $.ajax({url:target_url+src_project_id,
             beforeSend:function(){
             },
             complete:function(){
             },
             dataType:'json',
             success:function(){
               // reload this fucking page ...
               window.location.reload();
             },
     });
  }
}


/**
 * update local source to a specific release
 */
function change_project_to_this_release(active_a, target_url){
  $('#src_revision').text($('.glyphicon-ok').data('current_rev'));
  $('#target_revision').text($(active_a).text());
  $('#confirm_move_dialog').modal('show');
  $('#move_to').off().on('click',function(){ go_to(target_url);});
}

/**
 * retrieve json data for a specific repository (set active component)
 */
function fetch_this_other_project(active_a){
  var $active_a = $(active_a);
  var $tbody_comparison = $('#project_comparison tbody');
  $tbody_comparison.find('tr').remove();

  if($active_a.hasClass('active')){
    $active_a.removeClass('active');
  } else {
    var target_url = $active_a.data('url');
    var remote_project_name = $active_a.data('name');

    $('#project_comparison').show();
    $('#other_projects a').removeClass('active');
    $.ajax({url:target_url,
            async:false,
            dataType:'json',
            success:function(json_response){
                    $active_a.addClass('active');
                    var remote_project_last_change_list = json_response.last_hundred_change_list;
                    show_difference_between_changeset_stacks(remote_project_name, local_project_last_change_list, remote_project_last_change_list, current_node);
                 },
            });
  }
}

/**
 * display difference between two repository from te same project
 */
function show_difference_between_changeset_stacks(remote_project_name, local_last_change_list, remote_last_change_list, current_node){
  var top_remote_rev = parseInt(remote_last_change_list[0].rev);
  var top_local_rev = parseInt(local_last_change_list[0].rev);
  var more_recent_change_list, less_recent_change_list;
  var local_is_recent, pull, push;

  if (top_local_rev > top_remote_rev){
     // we are ahead 
     // means we can push to it
     local_is_recent = true;
     pull = false;
     push = true;
     more_recent_change_list = local_last_change_list;
     less_recent_change_list = remote_last_change_list;
  } else if (top_local_rev < top_remote_rev){
     // we are late
     // means we can from it
     pull = true;
     push = false;
     local_is_recent = false;
     less_recent_change_list = local_last_change_list;
     more_recent_change_list = remote_last_change_list;
  } else {
     pull = false;
     push = false;
     more_recent_change_list = local_last_change_list;
     less_recent_change_list = remote_last_change_list;
  }

  var j = 0;
  var sync=false;
  var row = [];
  var __recent_rev_, __less_rev_;

  $tbody_comparison = $('#project_comparison tbody');
  $tbody_comparison.find('tr').remove();

  for(var i=0 ; i < more_recent_change_list.length ; i++){
      if(sync){
        j++;
      }
      __recent_list_node = more_recent_change_list[i];

      if(j<less_recent_change_list.length){
        __less_list_node = less_recent_change_list[j];
      } else {
        __less_list_node = null;
      }

      row = [''];
      __recent_rev_ = __recent_list_node.rev;

      if (__less_list_node !== null && __less_list_node.node === __recent_list_node.node) {
        sync = true;
        __less_rev_ = __less_list_node.rev;
      } else if(__less_list_node !== null && sync) {
        __less_rev_ = __less_list_node.rev;
      } else {
        __less_rev_ = '';
      }


      if(local_is_recent){
        row.push(__less_rev_);
        row.push(__recent_rev_);
        if(__recent_list_node.node === current_node.node){
           row.push('<span class="glyphicon glyphicon-ok" style="color:#f0ad4e;font-size:27px"></span>');
        } else {
           row.push("");
        }
      } else {
        row.push(__recent_rev_);
        row.push(__less_rev_);

        if(__less_rev_!=="" && __less_list_node!== null && __less_list_node.node === current_node.node){
           row.push('<span class="glyphicon glyphicon-ok" style="color:#f0ad4e;font-size:27px"></span>');
        } else {
           row.push("");
        }
     }
     row.push(__recent_list_node.author);
     if (__recent_list_node.node == current_node.node){
      row.push('<span class="label label-warning">'+__recent_list_node.branch+'</span>');
     } else {
      row.push('<span class="label label-success">'+__recent_list_node.branch+'</span>');
     }
     row.push(__recent_list_node.branch);
     row.push(__recent_list_node.desc);
     $tbody_comparison.append('<tr><td>'+row.join('</td><td>')+'</td></tr>');
  }

  if(push || pull){
    $('#pushpull').show();
    $('#p_name_remote').text(remote_project_name);
    $('#p_name_local').text(local_project_name);

    if(push){
      $('#button_push').show();
      $('#button_pull').hide();
    } else if (pull){
      $('#button_push').hide();
      $('#button_pull').show();
    }
  } else {
    $('#pushpull').hide();
    $('#button_push').hide();
    $('#button_pull').hide();
  }

}

/**
 * update this project
 */
function update_project(target_url){
  $.ajax({url: target_url,
          method:'POST',
          data:$('#project').serialize(),
          dataType:'json',
          success:function(json_response){
              var default_url, $sel, _alert_html;
              $('.alert').remove();
              if(json_response.result){
                $('#edit_project_dialog').modal('hide');
                $sel = $('#projects_list');
                $('#project_name').text(json_response.project.name);
                if($sel){
                  $sel.find('li').remove();
                  default_url = $sel.data('url');
                  json_response.projects_list.forEach(function(item){
                    $sel.append('<li><a href="'+default_url+item.id+'">'+item.name+'</a></li>');
                  });
                }
                if(json_response.explanation){
                   _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('#container_alert').html(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove();});
                }
              } else if(json_response.explanation){
                 _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                 _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                 $('#container_alert').html(_alert_html);
                 $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove();});
              } else {
              
              }
            },
         });
}

/**
 * show edit user box
 *
 */
function edit_user(target_update_url, target_get_url, user_id){
  $.ajax({url:target_get_url,
          success:function(json_response){
             if(json_response.result){
                $('#update_user_dialog').modal('show');
                $('#update_user').attr('action',target_update_url);
                $('#update_user_name').val(json_response.user.name);
                $('#update_user_email').val(json_response.user.email);
                $('#update_user_password').val(json_response.user.pwd);
                $('#update_my_user').bind('click',function(){
                   update_user(target_update_url);
                });
	     }
	 }
  });
}

/**
 * send update
 *
 */
function update_user(target_url){
  $.ajax({url: target_url,
          method:'POST',
          data:$('#update_user_form').serialize(),
          dataType:'json',
          complete:function(){
          },
          success:function(json_response){
              var $sel, default_url, _alert_html;
              $('.alert').remove();
              if(json_response.result){
                $('#update_user_dialog').modal('hide');
                if(json_response.explanation){
                   _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('#container_alert').html(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove();});
                }
                update_user_list();
              } else if(json_response.explanation){
                   _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                $('#update_user_dialog .modal-body').after(_alert_html);
                $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove();});
              }
            },
         });
}

/**
* add a a user from filled form
*
*/
function add_user(target_url){
  $.ajax({url: target_url,
          method:'POST',
          data:$('#user').serialize(),
          dataType:'json',
          complete:function(){
          },
          success:function(json_response){
              var $sel, default_url, _alert_html;
              $('.alert').remove();
              if(json_response.result){
                $('#new_user_dialog').modal('hide');
                if(json_response.explanation){
                   _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('#container_alert').html(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove();});
                }
                update_user_list();
              } else if(json_response.explanation){
                   _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                $('#new_user_dialog .modal-body').after(_alert_html);
                $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove();});
              }
            },
         });
}

/**
 * remove a user ...
 */
function delete_user(button,target_delete_url){
  $.ajax({url:target_delete_url,
          method:'POST',
          success:function(){
            $(button).closest('tr').remove();
             if($('#users_overview').find('tr').not('tr:first').size()===0){
               $('#users_overview').append('<tr><td colspan="5" style="text-align:center;padding-top:20px">No Users defined</td></tr>');
             }
          }});
}

function update_user_list(){
  var target_url = $('#users_overview').data('update_url');
  $.ajax({ url:target_url,
           method:'GET',
           success:function(json_response){
             $('#users_overview').find('tr').not('tr:first').remove();
             if(json_response.lst_users.length>0){
               json_response.lst_users.forEach(function(user){
                 var name = '<td>'+user.name+'</td>';
                 var email = '<td>'+user.email+'</td>';
                 var creation_date = '<td>'+user.creation_date+'</td>';
                 var button_update = "<td><button class=\"btn btn-default\" onclick=\"edit_user('" + user.update_url + "','"+ user.get_url +"',"+user.id+")\">edit</button></td>";
                 var button_delete = "<td><button class=\"btn btn-default\" onclick=\"delete_user(this,'" + user.delete_url + "')\">delete</button></td>";
                 $('#users_overview').append('<tr>'+name+email+creation_date+button_update+button_delete+'</tr>');
               });
             } else {
                 $('#users_overview').append('<tr><td colspan="5" style="text-align:center;padding-top:20px">No Users defined</td></tr>');
             }
          }
        });
}

/**
 * Add a new project
 */
function add_project(target_url){
  $.ajax({url: target_url,
          method:'POST',
          data:$('#project').serialize(),
          dataType:'json',
          complete:function(){
          },
          success:function(json_response){
              var $sel, default_url, _alert_html;
              $('.alert').remove();
              if(json_response.result){
                $('#new_project_dialog').modal('hide');
                $sel = $('#projects_list');
                if($sel){
                  $sel.parent().show();
                  $sel.find('li').remove();
                  default_url = $sel.data('url');
                  json_response.projects_list.forEach(function(item){
                    $sel.append('<li><a href="'+default_url+item.id+'">'+item.name+'</a></li>');
                  });
                }
                if(json_response.explanation){
                   _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('#container_alert').html(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove();});
                }
              } else if(json_response.explanation){
                   _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                $('#new_project_dialog .modal-body').after(_alert_html);
                $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove();});
              }
            },
         });
}

/**
 * Delete a project regarding to its id
 */
function delete_this_project(){
  var target_url = $('#view_delete_project').data('url');
  $.ajax({url:target_url,
          success:function(json_response){
            if(json_response.result){
              // fallback to root
              go_to('/');
              return true;
            }
          } 
         });
}


function view_diff_revision(target_url){
  $.ajax({url:target_url,
          success:function(json_response){
            $('#files a').remove();
            var lst_links = [];
            var diffs_content = [];

            json_response.diff.lst_basename_files.forEach(function(item){
              var file_name = json_response.diff.lst_files[lst_links.length];
              lst_links.push('<a href="#" class="list-group-item" onclick="$(\'div[id^=file_]\').hide();$(\'#file_'+lst_links.length+'\').show()">'+item+'</a>');
              diffs_content.push('<div id="file_' + diffs_content.length + '" style="display:none">'+json_response.diff.dict_files[file_name]+'</div>');
            });

            $('#revision_description').html('id :'+json_response.revision.rev+'<br>'+json_response.revision.author+'<br><br>'+json_response.revision.desc);

            $('#files').html(lst_links.join('\n'));
            $('#diffs_container').show().html(diffs_content.join('\n'));
            $('#files_panel').show();
            $('#project_tab a[href="#revision"]').tab('show');
          } 
         });
}

function display_logs(active_button) {
  $button = $(active_button);

  if(!$button.hasClass('btn-success')){

    if('last_logs' in localStorage && localStorage.last_logs!==''){
      $button.addClass('btn-success');
      $('#logs').html(localStorage.last_logs).show();
    }

    $.ajax({ url:$button.data('url'),
             success:function(json_response){
               var log_resume = [];
               json_response.logs.forEach(function(item){
                 var _id = item.id.toString().rjust(4,'0');
                 log_resume.push("<ul class='row_log'><li>" + _id + "</li><li><i>"+item.creation_date +"</i></li><li>" + item.host + "</li><li>" + item.path + "</li><li>" + item.command+"</li></ul>");
               });
               var __loc_html = '<ul class="log"><li>'+log_resume.join('</li><li>')+'</li></ul>';
               $('#logs').html(__loc_html);
               $button.addClass('btn-success');
               $('#container_logs').show();
               $('#global_container').css('padding-bottom','160px');
               localStorage.logs_enabled=1;
               localStorage.last_logs=__loc_html;
             }
           });
  } else {
    $button.removeClass('btn-success');
    $('#container_logs').hide();
    localStorage.logs_enabled=0;
    $('#global_container').css('padding-bottom','0px');
  }

}

/**
 * Init js component for project overview page
 */
function init_page_overview(){
}
