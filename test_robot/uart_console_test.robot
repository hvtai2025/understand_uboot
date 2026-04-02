*** Settings ***
Library           Process

*** Test Cases ***
Virtual UART Console Test
    ${result}=    Run Process    python virtual_uart_test.py    shell=True
    Log    ${result.stdout}
    Should Contain    ${result.stdout}    UART virtual test passed.
    Should Be Equal As Integers    ${result.rc}    0
