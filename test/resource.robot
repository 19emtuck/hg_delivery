*** Settings ***
Documentation     A resource file with reusable keywords and variables.
...
...               The system specific keywords created here form our own
...               domain specific language. They utilize keywords provided
...               by the imported SeleniumLibrary.
Library           Selenium2Library

*** Variables ***
${SERVER}         localhost:6543
${BROWSER}        Chrome
${DELAY}          0
${VALID USER}     editor
${VALID PASSWORD}    editor
${LOGIN URL}      http://${SERVER}/
${WELCOME URL}    http://${SERVER}/
${ERROR URL}      http://${SERVER}/error.html

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


Remove All Projects
  [Documentation]  loop over projects to remove them ...
  ${projects_names}=  Execute Javascript     return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
  :FOR  ${next_link}    IN  @{projects_names}
  \   Click Element   css=form[name="view_project"] button.dropdown-toggle
  \   Click Element   css=#projects_list a[href='${next_link}']
  \   Wait Until Element Is Visible   css=#project_home
  \   Click Element   css=#manage_project
  \   Click Element   css=#view_delete_project
  \   Wait Until Element Is Visible   css=form[name="view_project"] button.dropdown-toggle
  \   // wait a bit ...
  \   Sleep  700 milliseconds

  ${projects_names}=  Execute Javascript  return $('#projects_list .project_link').map(function(id,item){return $(item).attr('href');}).toArray();
  ${nb_projects}=   Get Length   ${project_names}
  Should Be Equal As Numbers   0    ${nb_projects}