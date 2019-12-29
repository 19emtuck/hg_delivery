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
    Click Button    css=button[type="submit"].btn.btn-primary

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