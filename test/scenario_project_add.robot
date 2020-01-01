*** Settings ***
Documentation     A test suite with a single test for valid login.
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

Test Teardown     Close All Browsers
Suite Teardown     Close All Browsers

*** Test Cases ***
 Projects Add
    [Documentation]  Add a bunch of projects
    Login User
    Detach All Projects From Their Group
    Remove All Projects
    ${projects}=    Create List   d1  d2  d3
    :FOR  ${project_id}    IN    @{projects}
    \   Add New Project    ${project_id}    127.0.0.1   ${CURDIR}/repositories/${project_id}   ${SYSUSER}  ${SYSPWD}
    \   Sleep   1

User Can't Add Twice The Same Project
    [Documentation]   User Try to add twice the same project
    Login User
    # remove if known
    ${project_id}=   Set Variable   d1
    ${dest_host}=    Set Variable   127.0.0.1
    Remove Project By Its Name   ${project_id}
    Sleep   1 
    Add New Project    ${project_id}    ${dest_host}   ${CURDIR}/repositories/${project_id}   ${SYSUSER}  ${SYSPWD}
    # try to add it a second time
    Sleep   1 
    Add New Project And Wait For Failure    ${project_id}    ${dest_host}   ${CURDIR}/repositories/${project_id}   ${SYSUSER}  ${SYSPWD}
    Sleep   1 
    Remove Project By Its Name   ${project_id}
