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

function merge(){
  var full_path, node, p1node;
  orig1_url = $('#diffs_container').data('orig1');
  orig2_url = $('#diffs_container').data('orig2');

  full_path = $('#files a.active').data('full_path');
  node      = $('#revision_description').data('node');
  p1node    = $('#revision_description').data('p1node');

  orig2_url  = orig2_url.replace('--REV--', node).replace('--FNAME--',full_path);
  orig1_url  = orig1_url.replace('--REV--', p1node).replace('--FNAME--',full_path);

  // clean merge ...
  $('#merge').remove();
  $('#merge_container').html('<div id="merge"></div>').show();

  // create the object
  $('#merge').mergely({
      width: 'auto',
      height: '600',
      fgcolor: {a:'#ddffdd', c:'#cccccc', d:'#ffdddd'},
      bgcolor: '#fff',
      viewport: true,
      cmsettings: {mode: 'text/plain', readOnly: true, lineWrapping: false, lineNumbers: true},
      lhs: function(setValue) {
          /*if("${c.node1.is_binary}" == "True"){
              setValue('Binary file');
          }
          else{*/
              $.ajax(orig1_url, {dataType: 'text', success: setValue});
          //}

      },
      rhs: function(setValue) {
          /*if("${c.node2.is_binary}" == "True"){
              setValue('Binary file');
          }
          else{*/
              $.ajax(orig2_url, {dataType: 'text', success: setValue});
          //}
      }
  });
  $('#merge').show();
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
        $('#container_alert').html('<div class="low_gauge_container"><div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%;"><span class="sr-only">20% Complete</span> </div></div></div>');
      },
      complete:function(){
        $('#container_alert .progress-bar').css('width','100%').attr('aria-valuenow',100);
        $('#container_alert span').text('100% Complete');
      },
      dataType:'json',
      success:function(json_response){
        if(json_response.result){
          // we just reload the current comparison
          // get the active link and fetch him twice
          setTimeout(function() {
             $('#container_alert').html('');
             var link = $('#other_projects a.active')[0];
             $('#other_projects a.active').removeClass('active');
             fetch_this_other_project(link);}, 10);
        } else if(json_response.new_branch_stop){
          // dialog : should we force ?
          $('#confirm_force_push_dialog .modal-body').html("Should we push them ?<br><br>"+json_response.lst_new_branches.join(','));
          $('#abort_new_branch').off().on('click',function(){$('#container_alert').delay(1000).html('');});
          $('#new_branch').off().on('click',function(){ $('#confirm_force_push_dialog').modal('hide');$('#container_alert').html(''); push_to(target_project_id, target_url, true);});
          $('#confirm_force_push_dialog').modal('show');
        } else if(json_response.new_head_stop){
          $('#dismiss_force_push_dialog').modal('show');
          $('#container_alert').delay(1000).html('');
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
        $('#container_alert').html('<div class="low_gauge_container"><div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%;"><span class="sr-only">20% Complete</span> </div></div></div>');
      },
      complete:function(){
        $('#container_alert .progress-bar').css('width','100%').attr('aria-valuenow',100);
        $('#container_alert span').text('100% Complete');
      },
      dataType:'json',
      success:function(){
        setTimeout(function() {
          $('#container_alert').html('');
          // reload this fucking page ...
          window.location.reload(); }, 1250);
      },
    });
  }
}

function refresh_project_view(target_refresh_url) {
  $.ajax({url:target_refresh_url,
          success:function(html_response){
           $('#project_home').html(html_response);
          }
        });
}

/**
 * update local source to a specific release
 */
function change_project_to_this_release(active_a, target_url, target_refresh_url, target_brothers_check){
  // check other projects that may be interested by this move
  $.ajax({url:target_brothers_check,
          beforeSend:function(){
            $(active_a).hide();
            $('<div class="has-spinner active"><span class="spinner"><i class="icon-spin glyphicon glyphicon-refresh"></i></span></div>').insertBefore(active_a);
          },
          error:function(){
            $('#possible_update').hide();
            $('#none_possible_update').show();
          },
          complete:function(){
            $(active_a).show().prev().remove();
          },
          success:function(json_response){
             $('#possible_update a').remove();
             json_response.projects_sharing_that_rev.forEach(function(_link_project){
             if($('#possible_update a').size()===0){
               $('#possible_update').hide();
               $('#none_possible_update').show();
             } else {
               $('#possible_update').show();
               $('#none_possible_update').hide();
             }
               $('#possible_update').append('<a href="#" class="list-group-item" onclick="$(this).toggleClass(\'active\')" data-id="'+ _link_project.id + '">' + _link_project.name + '</a>');
             });

             if($('#possible_update a').size()===0){
               $('#possible_update').hide();
               $('#none_possible_update').show();
             } else {
               $('#possible_update').show();
               $('#none_possible_update').hide();
             }

             $('#src_revision').text($('.glyphicon-ok').data('current_rev'));
             $('#target_revision').text($(active_a).text());
             $('#confirm_move_dialog').modal('show');

             $('#move_to').off().on('click',function(){
               var lst_brother = $('#possible_update a.active').map(function(_i,_item){return $(_item).data('id');}).toArray();
               $.ajax({url:target_url+lst_brother.join('/'),
                       beforeSend:function(){
                         $('#confirm_move_dialog').modal('hide');
                         $(active_a).hide();
                         $('<div class="has-spinner active"><span class="spinner"><i class="icon-spin glyphicon glyphicon-refresh"></i></span></div>').insertBefore(active_a);
                       },
                       success:function(json_response){
                         refresh_project_view(target_refresh_url);
                         lst_projects_id = Object.keys(json_response.result);
                         var map_project = {};
                         json_response.projects_list.forEach(function(proj) {map_project[proj.id]=proj;});
                         $('#container_alert').html('');
                         lst_projects_id.forEach(function(_id) {
                           var _c, _h, _alert_html;
                           if(json_response.result[_id]){
                             _c = 'alert-success';
                             _h = '<strong>Project ' + map_project[_id].name + ' has been updated successfully</strong>';
                           } else {
                             _c = 'alert-danger';
                             _h = '<strong>Project ' + map_project[_id].name + ' has not been updated :( please check permission and or check local update with hg command</strong>';
                             $('div.has-spinner').next().show();
                             $('div.has-spinner').remove();
                           }
                           _alert_html = '<div class="alert '+_c+'"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                           _alert_html += _h + '</div>';
                           $('#container_alert').append(_alert_html);
                         });
                         $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove();});
                       }
                 });
             });
          }
  });
}

/**
 * retrieve json data for a specific repository (set active component)
 * this will allow an comparison between both repositories ...
 */
function fetch_this_other_project(active_a){
  var $active_a = $(active_a);

  if($active_a.hasClass('active')){
    if(!($('#button_pull').hasClass('active') || $('#button_push').hasClass('active'))){
      $active_a.removeClass('active');
      $('#pushpull').hide();
      $('#project_comparison').hide();
    }
  } else if(!($('#button_pull').hasClass('active') || $('#button_push').hasClass('active'))){
    var $tbody_comparison = $('#project_comparison tbody');
    $tbody_comparison.find('tr').remove();

    $('#other_projects a').removeClass('active');
    $active_a.addClass('active');

    var target_url = $active_a.data('url');
    var target_url_pull = $active_a.data('pulltest');
    var target_url_push = $active_a.data('pushtest');
    var starting_from_this_hash_node = $('#revision_table tbody tr').last().data('node');
    var remote_project_name = $active_a.data('name');

    $('#nosync').hide();
    $('#pushpull_buttons').show();
    $('#project_comparison, #pushpull').show();
    $('#button_pull, #button_push').attr('disabled','disabled').addClass('active');

    $.ajax({url:target_url_push,
            dataType:'json',
            complete:function(){
              $('#button_push').removeClass('active');
            },
            success:function(json_response){
              if(json_response.result){
                $('#p_name_remote').text(remote_project_name);
                $('#p_name_local').text(local_project_name);
                $('#button_push').removeAttr('disabled');
              }
              $.ajax({url:target_url_pull,
                      dataType:'json',
                      complete:function(){
                        $('#button_pull').removeClass('active');
                      },
                      success:function(json_response){
                        if(json_response.result){
                          $('#pushpull').show();
                          $('#p_name_remote').text(remote_project_name);
                          $('#p_name_local').text(local_project_name);
                          $('#button_pull').removeAttr('disabled');
                        } else {
                          if(typeof($('#button_push').attr('disabled'))!=='undefined') {
                            $('#nosync').show();
                            $('#pushpull_buttons').hide();
                          }
                        }
                      },
              });
            },
    });

    $.ajax({url:target_url,
            dataType:'json',
            success:function(json_response){
              var remote_project_last_change_list = json_response.last_hundred_change_list;
              show_difference_between_changeset_stacks(active_a, remote_project_name, local_project_last_change_list, remote_project_last_change_list, current_node);
            },
    });
  } else {
    $active_a.removeClass('active');
  }
}

/**
 * try to find the last node
 * that both share.
 **/
function find_last_common_node(local_last_change_list, remote_last_change_list){

  var node_local, node_remote, last_node, i, j, remote_list_pos, local_list_pos, nb_nodes_unknown_nodes_in_local,
      nb_nodes_unknown_nodes_in_remote, match;

  last_node       = null;
  local_list_pos  = null;
  remote_list_pos = null;

  nb_nodes_unknown_nodes_in_local  = 0;
  nb_nodes_unknown_nodes_in_remote = 0;

  for (i = local_last_change_list.length - 1; i >=0 ; i--) {
    node_local = local_last_change_list[i].node;
    match = false;
    for (j = remote_last_change_list.length - 1; j >=0 ; j--) {
      node_remote = remote_last_change_list[j].node;
      if(node_remote==node_local){
        local_list_pos  = i;
        last_node = node_remote;
        match = true;
      }
    }
    if(!match){
      nb_nodes_unknown_nodes_in_remote++;
    }
  }
  // we do reverse if necessary
  for (i = remote_last_change_list.length - 1; i >=0 ; i--) {
    node_remote = remote_last_change_list[i].node;
    match = false;
    for (j = local_last_change_list.length - 1; j >=0 ; j--) {
      node_local = local_last_change_list[j].node;
      if(node_remote==node_local){
        if(last_node === null){
          remote_list_pos = i;
          if(last_node ===null){
            last_node = node_remote;
          }
          match = true;
        }
      }
    }
    if(!match){
      nb_nodes_unknown_nodes_in_local++;
    }
  }

  return {  'last_node'                        : last_node,
            'local_list_pos'                   : local_list_pos,
            'remote_list_pos'                  : remote_list_pos,
            'nb_nodes_unknown_nodes_in_remote' : nb_nodes_unknown_nodes_in_remote,
            'nb_nodes_unknown_nodes_in_local'  : nb_nodes_unknown_nodes_in_local,
  };

}

function merging_list(local_last_change_list, remote_last_change_list, current_node, $tbody_comparison){
  // we should start from the back and get on, then reverse
  var row, rows_container, i, max_size_list;
  max_size_list = local_last_change_list.length >= remote_last_change_list.length  ? local_last_change_list.length  : remote_last_change_list.length;

  var __feed_row = function(row, node, current_node){

    if(node.node === current_node.node){
      row.push('<span class="glyphicon glyphicon-ok" style="color:#f0ad4e;font-size:27px"></span>');
    } else {
      row.push("");
    }
    row.push(node.author);

    if (node.node == current_node.node){
      row.push('<span class="label label-warning">'+node.branch+'</span>');
    } else {
      row.push('<span class="label label-success">'+node.branch+'</span>');
    }

    row.push(node.branch);
    row.push(node.date);
    row.push(node.desc);
  };

  var __build_row_for_interval = function(local_last_change_list, remote_last_change_list, current_node, i, rows_container, set_published) {
    var __local_node, __remote_node, row;
    if(local_last_change_list.length > i){
      __local_node = local_last_change_list[i];
      __local_node.rev = parseInt(__local_node.rev,10);
    } else {
      __local_node = null;
    }

    if(remote_last_change_list.length>i){
      __remote_node = remote_last_change_list[i];
      __remote_node.rev = parseInt(__remote_node.rev,10);
    } else {
      __remote_node = null;
    }

    if(__local_node!==null && __remote_node!==null && __local_node.node === __remote_node.node){
      row = ['',  __remote_node.rev,  __local_node.rev];
      __feed_row(row, __local_node, current_node);
      rows_container.push(row);
      set_published[__local_node.node] = rows_container.length - 1;
    } else if(__local_node!==null && __remote_node!==null) {
      if(__remote_node.node in set_published){
        row = rows_container[set_published[__remote_node.node]];
        row[1] = __remote_node.rev;
      } else {
        row = ['',  __remote_node.rev, ''];
        __feed_row(row, __remote_node, current_node);
        rows_container.push(row);
        set_published[__remote_node.node] = rows_container.length - 1;
      }
      if(__local_node.node in set_published){
        row = rows_container[set_published[__local_node.node]];
        row[2] = __local_node.rev;
      } else {
        row = ['',  '',  __local_node.rev];
          __feed_row(row, __local_node, current_node);
        rows_container.push(row);
        set_published[__local_node.node] = rows_container.length - 1;
      }
    } else if(__local_node!==null) {
      if(__local_node.node in set_published){
        row = rows_container[set_published[__local_node.node]];
        row[2] = __local_node.rev;
      } else {
        row = ['',  '',  __local_node.rev];
          __feed_row(row, __local_node, current_node);
        rows_container.push(row);
        set_published[__local_node.node] = rows_container.length - 1;
      }
    } else if(__remote_node!==null) {
      if(__remote_node.node in set_published){
        row = rows_container[set_published[__remote_node.node]];
        row[1] = __remote_node.rev;
      } else {
        row = ['',  __remote_node.rev, ''];
        __feed_row(row, __remote_node, current_node);
        rows_container.push(row);
        set_published[__remote_node.node] = rows_container.length - 1;
      }
    }
  };

  row = [];
  local_last_change_list.reverse();
  remote_last_change_list.reverse();
  set_published = {};
  rows_container = [];

  for (i = 0 ; i < max_size_list ; i++) {
    __build_row_for_interval(local_last_change_list, remote_last_change_list, current_node, i, rows_container, set_published);
  }

  rows_container.sort(function(a,b){
    var _a, _b;
    _a = a[1]!=='' ? a[1] : a[2];
    _b = b[1]!=='' ? b[1] : b[2];
    if(_a>_b){
      return -1;
    } else if(_b>_a){
      return 1;
    } else {
      return 0;
    }
  });


  rows_container.forEach(function(row){
    $tbody_comparison.append('<tr><td>'+row.join('</td><td>')+'</td></tr>');
  });
}

/**
 * display difference between two repositories from te same project
 */
function show_difference_between_changeset_stacks(active_a, remote_project_name, local_last_change_list, remote_last_change_list, current_node){
  var $tbody_comparison;
  $tbody_comparison = $('#project_comparison tbody');
  $tbody_comparison.find('tr').remove();
  merging_list(local_last_change_list, remote_last_change_list, current_node, $tbody_comparison);

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
          $sel.append('<li><a class="project_link" href="'+default_url+item.id+'">'+item.name+'</a></li>');
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
         data:$('#project_add').serialize(),
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
          $sel.append('<li><a class="project_link" href="'+default_url+item.id+'">'+item.name+'</a></li>');
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
    // we refresh the number of projects ...
    $('#project_number').text($('#projects_list li').size().toString());
  }
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

function activate_diff_file(file_link, __j){
  $(file_link).parent().find('a').not(file_link).removeClass('active');
  $(file_link).toggleClass('active');

  $('div[id^=file_]').hide();
  if($(file_link).parent().find('a.active').size()>0){
    $('#file_'+__j).show();
  } else {
    $('#file_'+__j).hide();
  }
  $('#merge').remove();
}

/**
 * View diff
 */
function view_diff_revision(target_url){
  $.ajax({url:target_url,
    success:function(json_response){
      $('#files a').remove();

      var lst_links     = [];
      var diffs_content = [];

      json_response.diff.lst_basename_files.forEach(function(item,__j){
        var file_name = json_response.diff.lst_files[__j];
        lst_links.push('<a href="#" data-full_path="'+file_name+'" class="list-group-item" onclick="activate_diff_file(this,'+__j+')">'+item+'</a>');
        var button_merge_style = "<button type='button' class='merge_trigger' onclick='merge()'><i class=\"glyphicon glyphicon-random\" title=\"more details (merge style)\"></i></button>";
        diffs_content.push('<div class="file_simple_diff" id="file_' + diffs_content.length + '" style="display:none">'+json_response.diff.dict_files[file_name]+ button_merge_style+'</div>');
      });

      // publish revision description ...
      var revision_description = "<ul style='list-style:none;padding-left:0'>";
      Object.keys(json_response.revision).forEach(function(attr_item){
	      if(json_response.revision[attr_item]){
		      revision_description+="<li><b>"+attr_item + "</b><span> : "+json_response.revision[attr_item]+"</span></li>";
	      }
      });
      revision_description += "</ul>";
      $('#revision_description').html(revision_description);
      $('#files').html(lst_links.join('\n'));
      $('#diffs_container').show().html(diffs_content.join('\n'));
      $('#files_panel').show();
      $('#revision_description').data('node',json_response.revision.node).data('p1node',json_response.revision.p1node);
      $('#project_tab a[href="#revision"]').tab('show');
    } 
  });
}

/**
 * Display log content
 */
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
 * Delete a task link to the input button
 */
function delete_this_task(button) {
  var $button = $(button);
  $button.prop('disabled',true);
  var url = $button.data('url');
  var label_button = $button.text();
  $.ajax({url:url,
    beforeSend:function(){
      $button.text('deleting ...');
    },
    complete:function(){
      setTimeout(function() { 
        $button.prop('disabled',false);
        $button.text(label_button);
      }, 600);
    },
    success:function(json_response){
      if(json_response.result){
        $button.closest('li').remove();
      }
    },
  });
}

/**
 * Run the task attached to this button
 */
function run_this_task(button){
  var $button = $(button);
  $button.prop('disabled',true);
  var url = $button.data('url');
  var label_button = $button.text();
  $.ajax({url:url,
    beforeSend:function(){
      $button.text('runing ...');
    },
    complete:function(json_response){
      setTimeout(function() { 
        $button.text(label_button);
        $button.prop('disabled',false);
      }, 600);
    },
  });

}

/**
 * Insert a new task inside DOM
 */
function add_new_task(){
  $('<li><input type="text" name="task_content" size="150"></li>').appendTo('#tasks_list');
}

/**
 * Save all project task and strip those whithout content
 */
function save_project_tasks(){
  var $button = $('#save_tasks');
  $button.prop('disabled',true);
  var label_button = $button.text();

  $('#tasks_list li input[type="text"]').each(function(id,item){
    if($(item).val()===''){
      $(item).remove();
    }
  });


  $.ajax({url:$('#project_tasks').attr('action'),
    method:'POST',
    data:$('#project_tasks').serialize(),
    beforeSend:function(){
      $('#save_tasks').text('saving ...');
    },
    success:function(json_response){
      $tasks_list = $('#tasks_list');
      $tasks_list.find('li').remove();

      json_response.tasks.forEach(function(item, i){
        var html = '<li>';
        html = html + ' <input type="text" name="task_content" size="150" value="' + item.content + '">';
        html = html + ' <button data-id="' + item.id + '" data-url="' + item.execute_url + '" onclick="run_this_task(this)" type="button" class="btn">run it ..</button>';
        html = html + ' <button data-id="' + item.id + '" data-url="' + item.delete_url + '" onclick="delete_this_task(this)" type="button" class="btn">delete it ..</button>';
        html = html + ' </li>';
        $(html).appendTo('#tasks_list');
      });

    },
    complete:function(){
      setTimeout(function() { 
        $button.text(label_button);
        $button.prop('disabled',false);
      }, 600);
    },
  });
}

/**
 * Save all project ACLS
 */
function save_project_acls(){
  var $button = $('#project_acls button');
  $button.prop('disabled',true);
  var label_button = $button.text();

  $.ajax({url:$('#project_acls').attr('action'),
    data:$('#project_acls').serialize(),
    beforeSend:function(){
      $('#project_acls button').text('saving ...');
    },
    complete:function(){
      setTimeout(function() { 
        $('#project_acls button').text(label_button);
        $button.prop('disabled',false);
      }, 600);
    },
    success:function(json_response){
    }
  });
}

/**
 * Init js component for project overview page
 */
function init_page_overview(){
}
