/**
 * Go to ...
 */
function go_to(url) {
  window.location.href = url;
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
