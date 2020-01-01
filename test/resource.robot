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
${BROWSER}        Chrome
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
    Maximize Browser Window
    Set Selenium Speed    ${DELAY}
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
    ${names_map}=  Execute Javascript     return Object.fromEntries(new Map($('#projects_list .project_link').map((id,item) => {return [[$(item).text(),$(item).attr('href')]];}).toArray()));
    ${url}=    Evaluate  $names_map.get('${project_name}')
    Go To   ${url}
    Wait Until Page Contains Element  id=project_name
    Wait Until Element Is Visible     id=project_name

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

Add New Project
    [Documentation]
    [Arguments]   ${name}     ${host}    ${path}   ${user}   ${pwd}
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
    ${result}=   Start Process   rm     -rf     ${CURDIR}/repositories

Create All Repositories Folder
    [Documentation]   remove local repositories directory
    ${result}=   Start Process   mkdir     ${CURDIR}/repositories

Init A Repository
    [Documentation]   Init a repo in repositories folder
    [Arguments]   ${folder}
    ${result}=   Start Process   hg     init     ${CURDIR}/repositories/${folder}

Write A File
    [Arguments]   ${file}   ${content}
    Create File   ${file}   ${content}
    Append To File   ${file}   ${content}

Commit Changes
    [Arguments]   ${folder}  ${message}
    ${result}=   Start Process   hg     ci   -m    "${message}"     ${CURDIR}/repositories/${folder}   -u   stephane.bard@gmail.com

Add File To Repo
    [Arguments]   ${folder}  ${fileName}
    ${result}=   Start Process   hg     add    ${filePath} 

Clone
    [Arguments]   ${src}  ${dst}
    ${result}=   Start Process   hg     clone   ${CURDIR}/repositories/${src}   ${CURDIR}/repositories/${dst}
