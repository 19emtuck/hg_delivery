/**
 * Go to ...
 */
function go_to(url) {
  window.location.href = url;
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
              $('#new_project').hide();
              var $sel = $('#project_name');
              $sel.show();
              if($sel){
                $sel.find('option').not('[value=""]').remove();
                json_response.projects_list.forEach(function(item){
                  $sel.append('<option value="'+item.id+'">'+item.name+'</option>');
                });
              }
              if(json_response.explanation){
                 var _alert_html = '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                 _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
                 $('#new_project').after(_alert_html);
                 $('.alert-success').delay(3000).fadeOut(500,function(){$(this).remove()});
              }
            } else if(json_response.explanation){
                 var _alert_html = '<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
                 _alert_html += '<strong>'+json_response.explanation+'</strong></div>';
              $('#new_project').after(_alert_html);
              $('.alert-danger').delay(3000).fadeOut(500,function(){$(this).remove()});
            }
            },
         });
}

/**
 * Delete a project regarding to its id
 */
function delete_this_project(id_project){
  var $button = $('#view_delete_project');
  var target_url = $button.data('url')+id_project;
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
  var $sel = $('#project_name');
  if($sel){
    $sel.bind('change', function(){
      var $sel = $('#project_name');
      var _value = $sel.val();
      if(_value){
        go_to($sel.data('url')+_value);
      }
    });
  }
}
