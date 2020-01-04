*** Settings ***
Documentation     A resource file with reusable keywords and variables.
...
...               The system specific keywords created here form our own
...               domain specific language. They utilize keywords provided
...               by the imported SeleniumLibrary.
Library           Selenium2Library
Library           Process
Library           OperatingSystem

*** Variables ***
${SERVER}         localhost:6543
# ${BROWSER}        Chrome
${BROWSER}        headlesschrome
${DELAY}          0
${VALID USER}     editor
${VALID PASSWORD}    editor
${LOGIN URL}      http://${SERVER}/
${WELCOME URL}    http://${SERVER}/
${ERROR URL}      http://${SERVER}/error.html
${LOCAL_PATH}     127.0.0.1

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Set Window Size 	2048 	1024
    Set Selenium Speed    ${DELAY}
    Set Selenium Timeout    20
    Login Page Should Be Open

Login Page Should Be Open
    Title Should Be    Hg Delivery 1.0

Go To Login Page
    Go To    ${LOGIN URL}
    Login Page Should Be Open

Input Username
    [Arguments]    ${username}
    Input Text     login    ${username}

Input Password
    [Arguments]    ${password}

    Input Text     password    ${password}

Submit Credentials
    Click Button    css=#login_form button

Welcome Page Should Be Open
    Location Should Be    ${WELCOME URL}
    Title Should Be    Hg Delivery 1.0 welcome :)

Login User
    Open Browser To Login Page
    Login Page Should Be Open
    Input Username  editor
    Input Password  editor
    Submit Credentials
    Welcome Page Should Be Open

Logout User
    Click Element   css=a[href="/logout"]
    Wait Until Page Contains    Sign in
    Wait Until Page Contains Element   css=button.btn[onclick*="login_form"]
    Login Page Should Be Open

Open A Project By Its Label
    [Arguments]    ${project_name}
    ${names_map}=  Execute Javascript     return Object.fromEntries(new Map($('#projects_list .project_link').map((id,item) => {return [[$(item).text(), window.location.origin+$(item).attr('href')]];}).toArray()));
    ${url}=    Evaluate  $names_map.get('${project_name}')
    Go To   ${url}
    Wait Until Page Contains Element  id=project_name
    Wait Until Element Is Visible     id=project_name
    Page Should Contain Element       id=project_name

Detach Projects From A Group
    ${lst_projects_links}=     Execute Javascript    return $('a.list-group-item[href*=edit]').map(function(_i,_item){return $(_item).attr('href');}).toArray();
    Wait Until Page Contains Element   css=.list-group-item
    :FOR   ${p_url}    IN    @{lst_projects_links}
    \    Execute Javascript   $('a[href="${p_url}"].list-group-item').find('button.close').click();
    \    Wait Until Page Does Not Contain Element   css=a[href="${p_url}"].list-group-item
    \    Sleep  200 milliseconds

Detach All Projects From Their Group
    Sleep  200 milliseconds

    # need to detach all projects from groups
    # read group list
    ${group_lst_urls}=  Execute Javascript    return $('a.project_link[href*=group]').map(function(_i,_item){ return window.location.origin+$(_item).attr('href');}).toArray();
    :FOR   ${group_url}    IN   @{group_lst_urls}
    \   Go To   ${group_url}
    \   Detach Projects From A Group

    Sleep  200 milliseconds

Delete All Macros
    Open Macros Tab
    ${listMacrosId}=   Execute Javascript    return Array.from($('button[data-macro_id][onclick^="delete_this_macro"]')).map((e)=>{return $(e).data('macro_id')})
    ${nb_macros}=   Get Length   ${listMacrosId}

    :FOR  ${_id}    IN    @{listMacrosId}
    \  Click Element   css=button[data-macro_id="${_id}"]
    \  Sleep  200 milliseconds

    # check no more macro available
    ${listMacrosId}=   Execute Javascript    return Array.from($('button[data-macro_id][onclick^="delete_this_macro"]')).map((e)=>{return $(e).data('macro_id')})
    ${nb_macros}=   Get Length   ${listMacrosId}
    Should Be Equal As Numbers   0    ${nb_macros}

Create PushToAll Macro
    [Arguments]   ${name}   ${direction}
    Open Macros Tab

    Click Element   css=div.tab-pane.active a
    Wait Until Element Is Visible    id=new_macro_dialog
    Wait Until Element Is Visible    css=input[name="macro_name"]
    Wait Until Element Is Visible    css=select[name^="direction_"]
    Page Should Contain Element    css=input[name="macro_name"]
    Page Should Contain Element    css=select[name^="direction_"]
    Input Text       macro_name        ${name}

    ${projects_names}=  Execute Javascript     return Array.from($('select[name^="direction_"]')).map((e)=>{return $(e).attr('name')})
    :FOR  ${name}    IN  @{projects_names}
    \    Select From List By Label   css=select[name^="${name}"]    ${direction}

    Click Element    id=button_add_macro
    Wait Until Element Is Not Visible   id=new_macro_dialog
    Wait Until Page Contains           Your macro has been recorded
    # Wait Until Page Contains           ${name}
    # Wait Until Page Contains           that imply : ${direction}
    Wait Until Element Is Visible  css=.alert-success
    Wait Until Element Is Not Visible  css=.alert-success


    Sleep    100 milliseconds

Add New Project
    [Documentation]
    [Arguments]   ${name}     ${host}    ${path}   ${user}   ${pwd}   ${group}=
    # back to default page to add a project
    Go To   ${WELCOME URL}
    Wait Until Page Contains Element    css=span[class="glyphicon glyphicon-plus"]
    Wait Until Element Is Visible       css=span[class="glyphicon glyphicon-plus"]
    Click Element    css=span[class="glyphicon glyphicon-plus"]
    Input Text       name        ${name}
    Input Text       host        ${host}
    Input Text       path        ${path}
    Input Text       user        ${user}
    Input Text       password    ${pwd}
    Click Element    id=add_my_project
    Wait Until Element Is Visible   id=new_project_dialog
    Wait Until Element Is Visible   css=.alert-success
    Wait Until Element Is Not Visible   css=.alert-success

Add New Project And Wait For Failure
    [Documentation]
    [Arguments]   ${name}     ${host}    ${path}   ${user}   ${pwd}
    Click Element    css=span[class="glyphicon glyphicon-plus"]
    Input Text       name        ${name}
    Input Text       host        ${host}
    Input Text       path        ${path}
    Input Text       user        ${user}
    Input Text       password    ${pwd}
    Click Element    id=add_my_project
    Wait Until Element Is Visible   id=new_project_dialog
    Wait Until Element Is Visible   css=.alert-danger
    Wait Until Element Is Not Visible   css=.alert-danger

Remove A Project By Its Url
    [Arguments]  ${project_url}
    Click Element   css=form[name="view_project"] button.dropdown-toggle
    Click Element   css=#projects_list a[href='${project_url}']
    Wait Until Element Is Visible   css=#project_home
    Click Element   css=#manage_project
    Click Element   css=#view_delete_project

Remove All Projects
    [Documentation]  loop over projects to remove them ...
    ${projects_names}=  Execute Javascript     return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
    ${nb_projects}=   Get Length   ${projects_names}
    ${index}=  Set Variable  0

    :FOR  ${next_link}    IN  @{projects_names}
    \   Remove A Project By Its Url   ${next_link}
    \   Run KeyWord If  ${index}<(${nb_projects}-2)    Wait Until Element Is Visible   css=form[name="view_project"] button.dropdown-toggle
    \   # wait a bit ...
    \   Sleep  300 milliseconds
    \   ${index}=    Evaluate    ${index} + 1

    ${projects_names}=  Execute Javascript  return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
    ${nb_projects}=   Get Length   ${projects_names}
    Should Be Equal As Numbers   0    ${nb_projects}

Remove Project By Its Name
    [Documentation]  
    [Arguments]   ${project_name}
    # ensure we are at the welcome URL
    Go To   ${WELCOME URL}
    ${names_map}=  Execute Javascript     return Object.fromEntries(new Map($('#projects_list .project_link').map((id,item) => {return [[$(item).text(),$(item).attr('href')]];}).toArray()));
    ${url}=    Evaluate  $names_map.get('${project_name}')
    Run Keyword If   '${url}'!='${None}'   Remove A Project By Its Url   ${url}

Remove All Repositories
    [Documentation]   remove local repositories directory
    ${result}=   Start Process   rm     -rf     ${CURDIR}${/}repositories

Create All Repositories Folder
    [Documentation]   remove local repositories directory
    ${result}=   Start Process   mkdir     ${CURDIR}${/}repositories

Init A Repository
    [Documentation]   Init a repo in repositories folder
    [Arguments]   ${folder}
    ${handle}=   Start Process   hg     init     ${CURDIR}${/}repositories${/}${folder}
    Wait For Process  ${handle}

Write A File
    [Arguments]   ${file}   ${content}
    Create File   ${file}   ${content}

Commit Changes
    [Arguments]   ${folder}  ${message}
    ${handle}=   Start Process   hg     ci   -m    ${message}     ${CURDIR}${/}repositories${/}${folder}  -u   stephane.bard@gmail.com    cwd=${CURDIR}${/}repositories${/}${folder}
    Wait For Process  ${handle}

Add File To Repo
    [Arguments]   ${folder}  ${fileName}
    ${handle}=   Start Process   hg     add    ${fileName}     cwd=${CURDIR}${/}repositories${/}${folder}
    Wait For Process  ${handle}

Branch
    [Arguments]  ${folder}   ${branchName}
    ${handle}=   Start Process   hg     branch    ${branchName}     cwd=${CURDIR}${/}repositories${/}${folder}
    Wait For Process  ${handle}

Clone
    [Arguments]   ${src}  ${dst}
    ${handle}=   Start Process   hg     clone   ${CURDIR}${/}repositories${/}${src}   ${CURDIR}${/}repositories${/}${dst}
    Wait For Process  ${handle}

Open Project Tab
    Wait Until Page Contains Element   css=a[href="#project_home"]
    Click Element     css=a[href="#project_home"]

Open Macros Tab
    Wait Until Page Contains Element   css=a[href="#macros"]
    Click Element     css=a[href="#macros"]

Open Linked Projects Tab
    Wait Until Page Contains Element   css=a[href="#related"]
    Click Element     css=a[href="#related"]

Open Revision Tab
    Wait Until Page Contains Element   css=a[href="#revision"]
    Click Element     css=a[href="#revision"]

Open Rights Management Tab
    Wait Until Page Contains Element   css=a[href="#users"]
    Click Element     css=a[href="#users"]

Open Additional Tasks Tab
    Wait Until Page Contains Element   css=a[href="#tasks"]
    Click Element     css=a[href="#tasks"]

Read Related Projects List
    [Documentation]  Returns a list of related projects
    ${lst_projects_links}=     Execute Javascript    return Array.from($('#other_projects .list-group-item')).map((e)=>{return $(e).text()})
    [return]   @{lst_projects_links}

Select A Linked Project
    [Arguments]   ${project}
    Wait Until Page Contains Element  css=#other_projects a[data-name="${project}"]
    Wait Until Element Is Visible     css=#other_projects a[data-name="${project}"]
    Wait Until Element Is Enabled     css=#other_projects a[data-name="${project}"]
    Sleep   200 milliseconds
    Click Element                     css=#other_projects a[data-name="${project}"]

Wait PushPullAble
    Wait Until Page Contains Element            css=button[id="button_push"].has-spinner.active
    Wait Until Page Contains Element            css=button[id="button_pull"].has-spinner.active
    Wait Until Page Does Not Contain Element    css=button[id="button_push"].has-spinner.active
    Wait Until Page Does Not Contain Element    css=button[id="button_pull"].has-spinner.active
    Sleep   200 milliseconds

Push To
    [Arguments]    ${to}
    Open Linked Projects Tab
    Select A Linked Project  ${to}
    Wait PushPullAble
    Click Element                       id=button_push
    Wait Until Page Contains Element    css=.progress-bar
    Wait Until Element Is Visible       css=.progress-bar
    Wait Until Element Is Not Visible   css=.progress-bar
    Wait Until Page Contains      nothing to synchronize ...
    Sleep    500 milliseconds

Pull From
    [Arguments]  ${from}
    Open Linked Projects Tab
    Select A Linked Project  ${from}
    Wait PushPullAble
    Click Element                       id=button_pull
    Wait Until Page Contains Element    css=.progress-bar
    Wait Until Element Is Visible       css=.progress-bar
    Wait Until Element Is Not Visible   css=.progress-bar
    Wait Until Page Contains      nothing to synchronize ...
    Sleep    500 milliseconds

Click On Row Col
    [Arguments]    ${row}  ${col}
    Execute Javascript   var e = document.createEvent('UIEvents');
    ...                    e.initUIEvent('click', true, true);
    ...                    $($('#d3_container ul').get(${row})).find('li:nth-child(${col}) a').get(0).dispatchEvent(e);

Css On Row Col
    [Arguments]    ${row}  ${col}   ${css_attr}  ${css_value}
    Execute Javascript    $($('#d3_container ul').get(${row})).find('li:nth-child(${col})').css(css_attr, css_value);

Get Link Label
   ${link_str}=   Execute Javascript    return $($('#d3_container ul').get(1)).find('li:nth-child(7) a').text();
   [Return]   ${link_str}

Encapsulate JS Call
    [Documentation]  In order to use Wait Until Keyword Succeeds, we need to implement Fail
    ...              ${js} should return a boolean true or false
    [Arguments]   ${js}
    ${result}=   Execute Javascript   ${js}
    Run Keyword If  ${result} == ${FALSE}    Fail
    [Return]  ${result}

Wait XHR Query
    Wait Until Keyword Succeeds   100x  50 milliseconds   Encapsulate JS Call   return $.active===1
    Wait Until Keyword Succeeds   100x  50 milliseconds   Encapsulate JS Call   return $.active===0

Chmod Folder
    [Arguments]   ${folder}  ${chmod}
    ${handle}=   Start Process   chmod   ${chmod}   ${CURDIR}${/}repositories${/}${folder} 
    Wait For Process  ${handle}
