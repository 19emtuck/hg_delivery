/**
 * Go to ...
 */
function go_to(url) {
  window.location.href = url;
}


function change_project_to_this_release(target_url){
  $('#confirm_move_dialog').modal('show');
  $('#move_to').off().on('click',function(){ go_to(target_url); });
}


function fetch_this_other_project(active_a){
  $('#other_projects a').removeClass('active');
  $active_a = $(active_a);
  var target_url = $active_a.data('url');
  var remote_project_name = $active_a.data('name');
  $.ajax({url:target_url,
          async:false,
          dataType:'json',
          success:function(json_response){
                  var remote_project_last_change_list = json_response.last_hundred_change_list;
                  $active_a.addClass('active');
                  show_difference_between_changeset_stacks(remote_project_name, local_project_last_change_list, remote_project_last_change_list, current_node);
               },
          });
}

function show_difference_between_changeset_stacks(remote_project_name, local_last_change_list, remote_last_change_list, current_node){
  var top_remote_rev = parseInt(remote_last_change_list[0].rev);
  var top_local_rev = parseInt(local_last_change_list[0].rev);
  var more_recent_change_list, less_recent_change_list;

  var local_is_recent;
  if (top_local_rev > top_remote_rev){
     local_is_recent = true;
     more_recent_change_list = local_last_change_list;
     less_recent_change_list = remote_last_change_list;
  } else {
     local_is_recent = false;
     less_recent_change_list = local_last_change_list;
     more_recent_change_list = remote_last_change_list;
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

      row = ['']
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

      row.push(__recent_list_node.author)

     if (__recent_list_node.node == current_node.node){
      row.push('<span class="label label-warning">'+__recent_list_node.branch+'</span>');
     } else {
      row.push('<span class="label label-success">'+__recent_list_node.branch+'</span>');
     }
      row.push(__recent_list_node.branch)
      row.push(__recent_list_node.desc)

      $tbody_comparison.append('<tr><td>'+row.join('</td><td>')+'</td></tr>');
  }

  $('#p_name_remote').text(remote_project_name)
  $('#p_name_local').text(local_project_name)

  $('#project_tab').hide();
  $('#project_comparison').show();

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
              $('.alert').remove();
              if(json_response.result){
                $('#edit_project_dialog').modal('hide');
                var $sel = $('#projects_list');
                $('#project_name').text(json_response.project.name);
                if($sel){
                  $sel.find('li').remove();
                  var default_url = $sel.data('url');
                  json_response.projects_list.forEach(function(item){
                    $sel.append('<li><a href="'+default_url+item.id+'">'+item.name+'</a></li>');
                  });
                }
                if(json_response.explanation){
                   var _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('.navbar').after(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove()});
                }
              } else if(json_response.explanation){
                 var _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                 _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                 $('.navbar').after(_alert_html);
                 $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove()});
              } else {
              
              }
            },
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
              $('.alert').remove();
              if(json_response.result){
                $('#new_project_dialog').modal('hide')
                var $sel = $('#projects_list');
                if($sel){
                  $sel.find('li').remove();
                  var default_url = $sel.data('url');
                  json_response.projects_list.forEach(function(item){
                    $sel.append('<li><a href="'+default_url+item.id+'">'+item.name+'</a></li>');
                  });
                }
                if(json_response.explanation){
                   var _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                   $('.navbar').after(_alert_html);
                   $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove()});
                }
              } else if(json_response.explanation){
                   var _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                   _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                $('.navbar').after(_alert_html);
                $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove()});
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

/**
 * Init js component for project overview page
 */
function init_page_overview(){
}
