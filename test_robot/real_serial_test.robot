*** Settings ***
Library           Process

*** Test Cases ***
Real Serial Console Test
    ${result}=    Run Process    python real_serial_test.py    shell=True
    Log    ${result.stdout}
    Should Contain    ${result.stdout}    Serial test PASS.
    Should Be Equal As Integers    ${result.rc}    0
