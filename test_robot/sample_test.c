#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TEST_SIZE_MB 10
#define TEST_PATTERN 0xAA

int main() {
    size_t size = TEST_SIZE_MB * 1024 * 1024;
    unsigned char *mem = (unsigned char *)malloc(size);
    if (!mem) {
        printf("MEMTEST_FAIL: Unable to allocate memory.\n");
        return 1;
    }
    memset(mem, TEST_PATTERN, size);
    for (size_t i = 0; i < size; ++i) {
        if (mem[i] != TEST_PATTERN) {
            printf("MEMTEST_FAIL: Memory corruption at byte %zu.\n", i);
            free(mem);
            return 2;
        }
    }
    printf("MEMTEST_PASS: Memory test succeeded for %d MB.\n", TEST_SIZE_MB);
    free(mem);
    return 0;
}
