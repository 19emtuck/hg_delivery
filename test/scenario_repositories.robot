*** Settings ***
Documentation     A test suite with a bunch of operations over repositories
...
...               push, pull, branch, errors about readonly ...
...

Resource          resource.robot
Library           Collections

Test Teardown     Close All Browsers
Suite Teardown    Close All Browsers

*** Test Cases ***

A Bunch Of Push Pull interactions
    [Documentation]  do a Push, do a Pull, get an error, get a new branch
    Remove All Repositories
    Create All Repositories Folder
    Init A Repository    d1
    Create File      ${CURDIR}${/}repositories${/}d1${/}README.txt
    Append To File   ${CURDIR}${/}repositories${/}d1${/}README.txt   PROJECT DESCRIPTION FILE\nHELLO WORLD !\n

    Add File To Repo  d1    README.txt
    Commit Changes    d1    initial_commit

    ${lst_projects_labels}  Create List    d1  d2  d3  d5  d6
    :For  ${label}   IN  @{lst_projects_labels}
    \   Clone  d1  ${label}

    Login User
    Detach All Projects From Their Group
    Remove All Projects
    :For  ${project_id}   IN   @{lst_projects_labels}
    \   Clone  d1  ${project_id}

    :For  ${project_id}   IN   @{lst_projects_labels}
    \   Add New Project    ${project_id}    127.0.0.1   ${CURDIR}${/}repositories${/}${project_id}   ${SYSUSER}  ${SYSPWD}
    \   Sleep   1

    Append To File   ${CURDIR}${/}repositories${/}d1${/}README.txt   \nAFTER INIT
    Sleep   100 milliseconds
    Commit Changes    d1    my_first_commit
    Open A Project By Its Label   d1
    Push To      d2
    Open A Project By Its Label   d2
    Element Should Be Visible    css=.glyphicon-ok
    Page Should Contain    my_first_commit
    Element Should Be Visible    id=project_name 
    Click On Row Col  1  2
    Wait Until Page Contains Element   id=confirm_move_dialog
    Wait Until Element Is Visible   id=confirm_move_dialog
    Click Element   id=move_to
    Wait XHR Query
    Wait Until Page Contains Element   id=container_alert
    Wait Until Element Is Visible   id=container_alert
    Sleep   1
    Wait Until Element Is Visible   css=.glyphicon-ok
    ${link_str}=   Get Link Label
    Should Be Equal As Strings   ${link_str}   my_first_commit
    Click On Row Col  1  7
    # click on revision link
    # wait until commit description's panel appears
    Wait Until Page Contains Element   id=files_panel
    Wait Until Element Is Visible      id=files_panel
    ${tab_str} =  Execute Javascript    return $('#project_tab li.active > a').text();
    Should Be Equal As Strings   ${tab_str}  Revision
    Wait Until Page Contains Element   css=div.source > pre
    Click Element   css=#files a
    Sleep   300 milliseconds

    Append To File   ${CURDIR}${/}repositories${/}d2${/}README.txt   \nHELLO WORLD !\nFROM d2 repositories. it rocks\nYes it is
    Commit Changes  d2  second_commit_d2
    Reload Page
    Wait Until Page Contains   second_commit_d2
    Element Should Be Visible    css=.glyphicon-ok
    Open A Project By Its Label   d1
    Element Should Be Visible    css=.glyphicon-ok
    Page Should Not Contain    second_commit_d2
    Pull From  d2
    Page Should Not Contain Element   css=.glyphicon-pushpin

    # now let's check you can't write a repo and get the error
    Chmod Folder   d1  500
    # we click on the first release line to update repo to
    # the last release
    Click On Row Col  1  2
    Wait Until Element Is Visible   id=confirm_move_dialog
    Wait Until Page Contains    from 1 to 2 revision
    Click Element   id=move_to
    Wait Until Element Is Not Visible   id=confirm_move_dialog
    Wait Until Page Contains   Project d1 has not been updated :( please check permission and or check local update with hg command
    Sleep   100 milliseconds
    Click Element    css=.alert button.close
    Chmod Folder   d1  755
    Click On Row Col  1  2
    Wait Until Element Is Visible   id=confirm_move_dialog
    Wait Until Page Contains    from 1 to 2 revision
    Click Element   id=move_to
    Wait Until Element Is Not Visible   id=confirm_move_dialog
    Wait Until Page Contains   Project d1 has been updated successfully
    Sleep   100 milliseconds
    Wait Until Element Is Not Visible   css=.alert

    # after update a new pushpin icon appear which gives update dates to user
    Element Should Be Visible  css=.glyphicon-pushpin

    # now both commits separatly 
    # but on different branch
    Write A File    ${CURDIR}${/}repositories${/}d1${/}README.txt   PROJECT DESCRIPTION FILE\nHELLO WORLD !\nFROM d2 repositories. it rocks\nThis is pretty awesome
    Branch   d1     brch_1
    Commit Changes    d1    third_commit

    Write A File    ${CURDIR}${/}repositories${/}d2${/}README.txt   PROJECT DESCRIPTION FILE\nHELLO WORLD !\nFROM d2 repositories. it rocks\nAre you sure ?
    Commit Changes    d2    third_commit_d2

    Open A Project By Its Label   d1
    Open Linked Projects Tab

    ${relatedLinks}=  Read Related Projects List
    ${tmpList}=       Create List    d6  d5  d3  d2
    Lists Should Be Equal       ${tmpList}    ${relatedLinks}    values=True

    Select A Linked Project  d2
    Wait PushPullAble
    Click Element                       id=button_push
    Wait Until Page Contains Element    css=.progress-bar
    Wait Until Element Is Visible       css=.progress-bar

    Wait Until Page Contains    It seems you are trying to push a new branch.

    Wait Until Page Contains Element    id=new_branch
    Wait Until Element Is Visible       id=new_branch
    Wait Until Element Is Enabled       id=new_branch
    Click Element                       id=new_branch

    Wait Until Element Is Not Visible   css=.modal-dialog
    Wait Until Page Contains Element    css=.progress-bar
    Wait Until Element Is Visible       css=.progress-bar
    Wait Until Element Is Not Visible   css=.progress-bar
    Wait PushPullAble
    Logout User

User Check Single Lonly Repository
    [Documentation]  user check a lonly Repository is not related to anything
    # a sperate repository (no clone) shall not be related to anything

    Login User
    Init A Repository    d4
    Write A File         ${CURDIR}${/}repositories${/}d4${/}README.txt   PROJECT DESCRIPTION FILE\nHELLO WORLD !
    Add File To Repo     d4    README.txt
    Commit Changes       d4    initial_commit

    Add New Project  d4  127.0.0.1  ${CURDIR}${/}repositories${/}d4${/}     ${SYSUSER}     ${SYSPWD}
    Open A Project By Its Label   d4
    Open Linked Projects Tab
    Page Should Contain    No linked project detected
    Logout User