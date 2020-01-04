*** Settings ***
Documentation     A test suite about tasks

Resource          resource.robot

Test Teardown     Close All Browsers
Suite Teardown    Close All Browsers


*** Test Cases ***

Wrong Task
    [Documentation]   Create a Task and run it and get an error
    Login User
    Open A Project By Its Label   d1
    Open Additional Tasks Tab
    Wait Until Page Contains Element   css=button[onclick="add_new_task()"]
    Page Should Contain Element        css=button[onclick="add_new_task()"]
    Remove All Tasks

    # now we will ad tasks that will provide error code or just errors
    # to check if we get back errors as well
    # sh grumpycommande
    Add A Task  grumpycommande
    ${bad_task_id}=   Execute Javascript   return $('button:contains("run it ..")').last().data('id');
    Click Element    css=button[data-id="${bad_task_id}"].run_task
    Wait Until Page Contains   runing ...
    Wait Until Page Contains   run it ..
    Wait Until Page Contains Element   css=.alert.alert-danger
    Click Element   css=div.alert button.close
    Wait Until Element Is Not Visible   css=.alert.alert-danger
    Delete A Task   ${bad_task_id}
    Check Last Log   grumpycommande   ${True}

Simple Task
    [Documentation]  run a simple task and check it appears in the log
    Login User
    Open A Project By Its Label   d1
    Open Additional Tasks Tab
    Wait Until Page Contains Element   css=button[onclick="add_new_task()"]
    Page Should Contain Element        css=button[onclick="add_new_task()"]
    Remove All Tasks
    # add a simple ls -al task
    Add A Task  ls -al
    ${bad_task_id}=   Execute Javascript   return $('button:contains("run it ..")').last().data('id');
    Click Element    css=button[data-id="${bad_task_id}"].run_task
    Wait Until Page Contains   runing ...
    Wait Until Page Contains   run it ..
    Check Last Log   ls -al