// Path to board config ELF (ccs_init_elf_file)
// File này chứa code cấu hình pinmux, clock, peripheral cho board
var ccs_init_elf_file = "/ti/j7presi/workarea/pdk/packages/ti/drv/sciclient/tools/ccsLoadDmsc/j784s4/sciclient_ccs_init_mcu1_0_release.xer5f";
// --- Board config: load and run ccs_init_elf_file ---
function runBoardConfig() {
    print("\n[STEP] Nạp và chạy board config ELF trên MCU1_0: " + ccs_init_elf_file);
    print("  -> File này sẽ cấu hình pinmux, clock, peripheral (GPIO, UART, v.v.)");
    dsMCU1_0.memory.loadProgram(ccs_init_elf_file);
    dsMCU1_0.target.halt();
    dsMCU1_0.target.run();
    dsMCU1_0.target.halt();
    print("[INFO] Board config ELF đã thực thi xong.\n");
}

// --- Check pinmux/clock for GPIO0 ---
function checkGPIO0PinmuxClock(label) {
    // Địa chỉ thanh ghi pinmux và clock (cần xác nhận theo TRM board)
    var PINMUX_ADDR = 0x40F80120;
    var GPIO_CLKCTRL_ADDR = 0x40F00038;
    var pinmux = dsMCU1_0.memory.readWord(0, PINMUX_ADDR);
    var clkctrl = dsMCU1_0.memory.readWord(0, GPIO_CLKCTRL_ADDR);
    print("[CHECK] " + label + ":");
    print("  - GPIO0_0 pinmux [0x" + PINMUX_ADDR.toString(16) + "]: 0x" + pinmux.toString(16) +
          " (0: default, 4: GPIO mode, các giá trị khác: mode khác)");
    print("  - MCU_GPIO0_CLKCTRL [0x" + GPIO_CLKCTRL_ADDR.toString(16) + "]: 0x" + clkctrl.toString(16) +
          " (0x2: enabled, 0x0: disabled, các bit khác: trạng thái khác)");
    return {pinmux: pinmux, clkctrl: clkctrl};
}
/*
 * Minimal GPIO0_0 input polling script for J784S4
 * Only initializes debug session, configures GPIO0_0 as input, and polls for 1 minute.
 */


// GPIO0 base address and register offsets for J784S4 (check TRM for confirmation)
var GPIO0_BASE = 0x600000;
var GPIO_OE_OFFSET = 0x134;    // Output Enable Register
var GPIO_DATAIN_OFFSET = 0x138; // Data In Register
var GPIO0_0_BIT = 1 << 0;      // GPIO0_0 is bit 0

// Path to SYSFW binary (edit if needed)
var sysfw_bin = "/ti/j7presi/workarea/pdk/packages/ti/drv/sciclient/soc/sysfw/binaries/ti-fs-firmware-j784s4-gp.bin";

importPackage(Packages.com.ti.debug.engine.scripting);
importPackage(Packages.com.ti.ccstudio.scripting.environment);
importPackage(Packages.java.lang);

// Create scripting environment and get debug server
var script = ScriptingEnvironment.instance();
var debugServer = script.getServer("DebugServer.1");

// Open debug sessions
var dsDMSC_0 = debugServer.openSession(".*CORTEX_M4F_0");
var dsMCU1_0 = debugServer.openSession(".*MCU_Cortex_R5_0");

// --- SYSFW/DMSC init ---
function loadSysfw() {
    print("Connecting to DMSC (CORTEX_M4F_0)...");
    dsDMSC_0.target.connect();
    print("Resetting DMSC...");
    var sysResetVar = dsDMSC_0.target.getResetType(1);
    sysResetVar.issueReset();
    print("Fill R5F ATCM memory...");
    dsDMSC_0.memory.fill(0x61000000, 0, 0x8000, 0);
    print("Writing While(1) for R5F");
    dsDMSC_0.memory.writeWord(0, 0x61000000, 0xE59FF004); /* ldr pc, [pc, #4] */
    dsDMSC_0.memory.writeWord(0, 0x61000004, 0x38);       /* Address 0x38 */
    dsDMSC_0.memory.writeWord(0, 0x61000038, 0xEAFFFFFE); /* b #0x38 */
    print("Loading DMSC SYSFW ... " + sysfw_bin);
    dsDMSC_0.memory.loadRaw(0, 0x40000, sysfw_bin, 32, false);
    print("DMSC SYSFW Load Done...");
    // Set Stack pointer and Program Counter
    var stackPointer = dsDMSC_0.memory.readWord(0, 0x40000);
    var progCounter = dsDMSC_0.memory.readWord(0, 0x40004);
    dsDMSC_0.memory.writeRegister("SP", stackPointer);
    dsDMSC_0.memory.writeRegister("PC", progCounter);
    print("DMSC SYSFW run starting now...");
    dsDMSC_0.target.runAsynch();
}

// --- MCU1_0 connect ---
function connectMCU1_0() {
    print("Connecting to MCU1_0...");
    dsMCU1_0.target.connect();
}

function setupGPIO0_0_Input() {
    print("Configuring GPIO0_0 as input...");
    var oe = dsMCU1_0.memory.readWord(0, GPIO0_BASE + GPIO_OE_OFFSET);
    oe = oe | GPIO0_0_BIT; // Set bit to 1 for input
    dsMCU1_0.memory.writeWord(0, GPIO0_BASE + GPIO_OE_OFFSET, oe);
    print("GPIO0_OE register after config: 0x" + oe.toString(16));
}

function pollGPIO0_0_1min() {
    print("Polling GPIO0_0 for 1 minute (60s)...");
    var pressed = false;
    var start = java.lang.System.currentTimeMillis();
    var timeout = 60 * 1000; // 60 seconds
    var pollCount = 0;
    while ((java.lang.System.currentTimeMillis() - start) < timeout) {
        var datain = dsMCU1_0.memory.readWord(0, GPIO0_BASE + GPIO_DATAIN_OFFSET);
        var value = (datain & GPIO0_0_BIT) ? 1 : 0;
        print("GPIO0_0 value: " + value + " (DATAIN=0x" + datain.toString(16) + ")");
        if (value == 0) { // Assuming active low button
            print("GPIO0_0 PRESSED!");
            pressed = true;
            break;
        }
        pollCount++;
        java.lang.Thread.sleep(100); // Poll every 100ms
    }
    if (!pressed) {
        print("GPIO0_0 was NOT pressed in 1 minute.");
    }
    print("Total polls: " + pollCount);
}

dsMCU1_0.target.disconnect();



// --- Main ---
print("\n[INFO] ====== TEST GPIO0_0: SYSFW + BoardConfig + Pinmux/Clock ======\n");
loadSysfw();
connectMCU1_0();

// Kiểm tra trạng thái pinmux/clock TRƯỚC khi chạy board config
var before = checkGPIO0PinmuxClock("Trước khi chạy board config");

// Nạp và chạy board config ELF
runBoardConfig();

// Kiểm tra lại trạng thái pinmux/clock SAU khi chạy board config
var after = checkGPIO0PinmuxClock("Sau khi chạy board config");

// So sánh kết quả
if (before.pinmux !== after.pinmux || before.clkctrl !== after.clkctrl) {
    print("[RESULT] Board config đã thay đổi pinmux/clock cho GPIO0_0. Peripheral đã ready để test GPIO!\n");
} else {
    print("[WARNING] Board config KHÔNG thay đổi pinmux/clock. Kiểm tra lại file cấu hình hoặc địa chỉ thanh ghi!\n");
}

// Tiếp tục test GPIO
setupGPIO0_0_Input();
pollGPIO0_0_1min();
dsMCU1_0.target.disconnect();
