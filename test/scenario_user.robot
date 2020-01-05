*** Settings ***
Documentation     A test suite with a single test for valid login.
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot
Test Teardown     Close All Browsers
Suite Teardown    Close All Browsers

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
    Login User
    Click Element  css=li a[href$="users/view"]
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

Can't Add Twice
    [Documentation]  Can't add the same user twice ...
    Login User
    Click Element  css=li a[href$="users/view"]
    Wait Until Page Contains   User management
    Wait Until Element Is Visible   css=span[class="glyphicon glyphicon-plus"]

    # loop over users to add them ...
    Remove Previous Users
    ${user1}=   Create Dictionary   name=twice  email=twice@free.fr  pwd=twice
    Add User  ${user1['name']}    ${user1['email']}   ${user1['pwd']}
    Add User  ${user1['name']}    ${user1['email']}   ${user1['pwd']}   error=True
    Logout User