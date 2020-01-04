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
    Open Browser To Login Page
    Login Page Should Be Open
    Input Username  editor
    Input Password  editor
    Submit Credentials
    Welcome Page Should Be Open
    Logout User
