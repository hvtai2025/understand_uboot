*** Settings ***
Library           Process

*** Test Cases ***
Run Sample Memory Test
    ${result}=    Run Process    ./sample_test    shell=True    stdout=MEMTEST_PASS: Memory test succeeded for 10 MB.    stderr=MEMTEST_FAIL
    Should Contain    ${result.stdout}    MEMTEST_PASS
    Should Be Equal As Integers    ${result.rc}    0
