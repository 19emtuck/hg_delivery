*** Settings ***
Documentation     A test suite with a single test for valid login.
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.

Library           Process
Resource          resource.robot
Test Teardown     Close All Browsers
Suite Teardown    Close All Browsers

*** Keywords ***

Open User View
    Click Element   css=a[href*="users/view"]

*** Test Cases ***

Test User Can Login
    [Documentation]   User can log in
    Open Browser To Login Page
    Login Page Should Be Open
    Input Username  editor
    Input Password  editor
    Submit Credentials
    Welcome Page Should Be Open
    Logout User

Test User Can't Login
    [Documentation]   User can't log in
    Open Browser To Login Page
    Login Page Should Be Open
    Input Username  editor
    Input Password  bad
    Submit Credentials
    Login Page Should Be Open

Init Some Users
    [Documentation]  admin can add some users and delete them
    Open Browser To Login Page
    Login User
    Open User View
    Wait Until Page Contains   User management
    Wait Until Element Is Visible   css=span[class="glyphicon glyphicon-plus"]

    # loop over users to add them ...
    Remove Previous Users
    ${user1}=   Create Dictionary   name=toto  email=toto@free.fr  pwd=dudule
    ${user2}=   Create Dictionary   name=titi  email=titi@free.fr  pwd=dudule
    ${user3}=   Create Dictionary   name=tata  email=tata@free.fr  pwd=dudule

    Add User  ${user1['name']}    ${user1['email']}   ${user1['pwd']}
    Add User  ${user2['name']}    ${user2['email']}   ${user2['pwd']}
    Add User  ${user3['name']}    ${user3['email']}   ${user3['pwd']}
    Logout User

    # new user can login
    Go To   ${LOGIN URL}
    Login Page Should Be Open
    Input Username  ${user1['email']}
    Input Password  ${user1['pwd']}
    Submit Credentials
    Welcome Page Should Be Open

Can't Add Twice
    [Documentation]  Can't add the same user twice ...
    Open Browser To Login Page
    Login User
    Open User View
    Wait Until Page Contains   User management
    Wait Until Element Is Visible   css=span[class="glyphicon glyphicon-plus"]

    # loop over users to add them ...
    Remove Previous Users
    ${user1}=   Create Dictionary   name=twice  email=twice@free.fr  pwd=twice
    Add User  ${user1['name']}    ${user1['email']}   ${user1['pwd']}
    Add User  ${user1['name']}    ${user1['email']}   ${user1['pwd']}   error=True
    Logout User

Unknown User Can't Access Pages
    [Documentation]  ...
    Open Browser To Login Page
    Login User
    ${URLs}=   Get All Projects URLs
    Delete All cookies
    Go To   ${WELCOME URL}/users/view
    Page Should Contain   403 Forbidden
    FOR  ${project_url}   IN     @{URLs}
        Go To   ${project_url}
        Page Should Contain   403 Forbidden
    END
      
Check Some User Credentials
    [Documentation]   check credentials
    # check some user exist
    # change from role change it's credentials on a project
    Open Browser To Login Page
    Login User
    Open User View

    # check tata is there
    ${userKnown}=   Execute Javascript   return $('td:contains("tata@free.fr")').length>0;
    Run KeyWord If  ${userKnown}==${False}   Add User  tata    tata@free.fr   dudule
    Wait Until Page Contains    tata@free.fr
    Page Should Contain         tata@free.fr

    Page Should Contain        d1
    ${project_url} =   Execute Javascript    return window.location.origin+$('#projects_list a:contains("d1")').attr('href');
    Go To   ${project_url}

    Open Rights Management Tab
    Open User View
    # restrict ACLs display to the user we aim
    Modify All ACL's User To Specific Value    tata@free.fr    edit
    ${acls}=   Get ACL User Has On A Project  tata    d1
    Should Be Equal As Strings   ${acls}   edit
    Logout User

    Login User  tata@free.fr  dudule
    ${names_map}=  Execute Javascript     return Object.fromEntries(new Map($('#projects_list .project_link').map((id,item) => {return [[$(item).text(), window.location.origin+$(item).attr('href')]];}).toArray()));
    Dictionary Should Contain Key   ${names_map}   d1
    Open A Project By Its Label  d1
    Logout User
    Login User
    Open User View
    # restrict ACLs display to the user we aime
    Modify All ACL's User To Specific Value    tata@free.fr    ${EMPTY}
    Logout User
    Login User  tata@free.fr  dudule
    ${names_map}=  Execute Javascript     return Object.fromEntries(new Map($('#projects_list .project_link').map((id,item) => {return [[$(item).text(), window.location.origin+$(item).attr('href')]];}).toArray()));
    Dictionary Should Not Contain Key   ${names_map}   d1
    Logout User
