/**
 * Add a new project
 *
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
              if($sel){
                $sel.find('option').remove();
                json_response.projects_list.forEach(function(item){
                  $sel.append('<option value="'+item.id+'">'+item.name+'</option>');
                });
              }
              if(json_response.explanation){
                 $('#new_project').after('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <strong>'+json_response.explanation+'</strong></div>');
              }
            } else if(json_response.explanation){
              $('#new_project').after('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <strong>'+json_response.explanation+'</strong></div>');
            }
            },
         });
}

