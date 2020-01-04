*** Settings ***
Documentation     A test suite about macros

Resource          resource.robot

Test Teardown     Close All Browsers
Suite Teardown    Close All Browsers


*** Keywords ***

Wait End Of Push
    ${result}=   Execute Javascript   return $('#new_branch').is(':visible') || $('.alert-success').is(':visible') === true;
    Run Keyword If  ${result} == ${FALSE}    Fail
    [Return]  ${result}

*** Test Cases ***

Create A Push Macro And Execute It
    [Documentation]   Create a Push macro and execute it
    Login User
    Open A Project By Its Label   d1

    Delete All Macros
    Create PushToAll Macro  TEST MACRO PUSH   push 
    ${listMacrosId}=   Execute Javascript    return Array.from($('button[data-macro_id][onclick^="delete_this_macro"]')).map((e)=>{return $(e).data('macro_id')})
    ${nb_macros}=   Get Length   ${listMacrosId}
    Should Be Equal As Numbers   1    ${nb_macros}
    Create PushToAll Macro  TEST MACRO PULL  pull 
    ${listMacrosId}=   Execute Javascript    return Array.from($('button[data-macro_id][onclick^="delete_this_macro"]')).map((e)=>{return $(e).data('macro_id')})
    ${nb_macros}=   Get Length   ${listMacrosId}
    Should Be Equal As Numbers   2    ${nb_macros}

    Click Element     css=#macros_list li button:last-child
    Wait Until Page Contains   runing ...
    Wait XHR Query

    Wait Until Keyword Succeeds  20s   1s      Wait End Of Push
    ${addBranch}=   Execute Javascript   return $('#new_branch').is(':visible');

    Run Keyword IF  ${addBranch}==${TRUE}   Click Element  id=new_branch
    Run Keyword IF  ${addBranch}==${TRUE}   Wait Until Element Is Not Visible   id=dismiss_force_push_dialog

    Wait Until Page Contains   run it
    Wait Until Element Is Visible  css=.alert-success
    Wait Until Element Is Not Visible  css=.alert-success

Create A Pull Macro And Execute It
    [Documentation]   Create a Pull macro and execute it
    Login User
    Open A Project By Its Label   d1

    Delete All Macros
    Create PushToAll Macro  TEST MACRO PULL    pull 
    ${listMacrosId}=   Execute Javascript    return Array.from($('button[data-macro_id][onclick^="delete_this_macro"]')).map((e)=>{return $(e).data('macro_id')})
    ${nb_macros}=   Get Length   ${listMacrosId}
    Should Be Equal As Numbers   1    ${nb_macros}

    Click Element     css=#macros_list li button:last-child
    Wait Until Page Contains   runing ...
    Wait XHR Query
    Wait Until Page Contains   run it
    Sleep   1
    Wait Until Element Is Visible  css=.alert-success
    Wait Until Element Is Not Visible  css=.alert-success