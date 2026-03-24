/*
 * toggle.js - Toggle GPIO0_8, GPIO0_9, GPIO0_11, GPIO0_6 on J784S4
 * Usage: loadJSFile "<path>/toggle.js" from CCS Scripting console
 *
 * This script includes PINMUX config and toggles the pins as output.
 */
//~ti_sdk_pdk_rtos/source/ti-processor-sdk-rtos-j784s4-evm-11_02_00_06/pdk_j784s4_11_02_00_15/packages/ti/csl/soc/j784s4
//#include "J784S4_pinmux.h" J784S4_pinmux_data.c
//https://www.ti.com/lit/ug/spruj52e/spruj52e.zip?ts=1774353856198&ref_url=https%253A%252F%252Fwww.ti.com%252Fproduct%252FTDA4VPE-Q1%253FkeyMatch%253DTDA4VPE-Q1%2526tisearch%253Duniversal_search

// ====== USER CONFIGURATION ======
// Set this to 1, if using 'FreeRTOS'
var isFreertos = 1;
// Set this to 1, if using 'SafeRTOS'
var isSafertos = 0;

// PDK path. Edit this for your environment
var pdkPath = "/ti/j7presi/workarea/pdk";
var pathSciclient = pdkPath+"/packages/ti/drv/sciclient/tools/ccsLoadDmsc/j784s4/";
var ccs_init_elf_file = pathSciclient+"sciclient_ccs_init_mcu1_0_release.xer5f";
var sysfw_bin = pdkPath+"/packages/ti/drv/sciclient/soc/sysfw/binaries/ti-fs-firmware-j784s4-gp.bin";

// ====== Import DSS Packages ======
importPackage(Packages.com.ti.debug.engine.scripting);
importPackage(Packages.com.ti.ccstudio.scripting.environment);
importPackage(Packages.java.lang);
importPackage(Packages.java.io);

// ====== Script/Debug Vars ======
var ds, debugServer, script;
var withinCCS = (ds !== undefined);
if (!withinCCS) {
    script = ScriptingEnvironment.instance();
    debugServer = script.getServer("DebugServer.1");
} else {
    debugServer = ds;
    script = env;
}

// ====== Target Sessions ======
var dsMCU1_0, dsMCU1_1, dsDMSC_0;
function updateScriptVars() {
    dsMCU1_0 = debugServer.openSession(".*MCU_Cortex_R5_0");
    dsMCU1_1 = debugServer.openSession(".*MCU_Cortex_R5_1");
    dsDMSC_0 = debugServer.openSession(".*CORTEX_M4F_0");
}

// ====== PINMUX Register Addresses (from TRM) ======
var WKUP_CTRL_MMR0_BASE = 0x43000000;
var PADCONFIG = {
    WKUP_GPIO0_8:  0x0E0,
    WKUP_GPIO0_9:  0x0E4,
    WKUP_GPIO0_11: 0x0EC,
    WKUP_GPIO0_6:  0x0D8
};

// ====== PINMUX Config Values (from pinmux tool) ======
var PINMUX_VAL = {
    WKUP_GPIO0_8:  0x00070007, // MODE(7), input enable, no pull
    WKUP_GPIO0_9:  0x00070007, // MODE(7), input enable, no pull
    WKUP_GPIO0_11: 0x00050005, // MODE(5), input enable, no pull
    WKUP_GPIO0_6:  0x00070007  // MODE(7), input enable, no pull
};

// ====== GPIO Register Addresses ======
var WKUP_GPIO0_BASE = 0x42110000;
var GPIO_OE_OFFSET = 0x134;
var GPIO_DATAOUT_OFFSET = 0x13C;

var GPIO_BITS = {
    GPIO0_8: 1 << 8,
    GPIO0_9: 1 << 9,
    GPIO0_11: 1 << 11,
    GPIO0_6: 1 << 6
};

// ====== PINMUX Configuration ======
function setupPinmux() {
    print("Configuring PINMUX for WKUP_GPIO0_8, 9, 11, 6...");
    dsMCU1_0.memory.writeWord(0, WKUP_CTRL_MMR0_BASE + PADCONFIG.WKUP_GPIO0_8,  PINMUX_VAL.WKUP_GPIO0_8);
    dsMCU1_0.memory.writeWord(0, WKUP_CTRL_MMR0_BASE + PADCONFIG.WKUP_GPIO0_9,  PINMUX_VAL.WKUP_GPIO0_9);
    dsMCU1_0.memory.writeWord(0, WKUP_CTRL_MMR0_BASE + PADCONFIG.WKUP_GPIO0_11, PINMUX_VAL.WKUP_GPIO0_11);
    dsMCU1_0.memory.writeWord(0, WKUP_CTRL_MMR0_BASE + PADCONFIG.WKUP_GPIO0_6,  PINMUX_VAL.WKUP_GPIO0_6);
    print("PINMUX config done.");
}

// ====== GPIO Output Setup ======
function setupGPIO_Output() {
    print("Configuring GPIO0_8, 9, 11, 6 as OUTPUT...");
    var oe = dsMCU1_0.memory.readWord(0, WKUP_GPIO0_BASE + GPIO_OE_OFFSET);
    oe = oe & ~(GPIO_BITS.GPIO0_8 | GPIO_BITS.GPIO0_9 | GPIO_BITS.GPIO0_11 | GPIO_BITS.GPIO0_6); // 0 = output
    dsMCU1_0.memory.writeWord(0, WKUP_GPIO0_BASE + GPIO_OE_OFFSET, oe);
    print("GPIO_OE after config: 0x" + oe.toString(16));
}

// ====== Toggle Test ======
function toggleGPIOs(iter, delayMs) {
    print("Toggling GPIO0_8, 9, 11, 6 for " + iter + " cycles...");
    for (var i = 0; i < iter; i++) {
        // Set all HIGH
        var val = dsMCU1_0.memory.readWord(0, WKUP_GPIO0_BASE + GPIO_DATAOUT_OFFSET);
        val |= (GPIO_BITS.GPIO0_8 | GPIO_BITS.GPIO0_9 | GPIO_BITS.GPIO0_11 | GPIO_BITS.GPIO0_6);
        dsMCU1_0.memory.writeWord(0, WKUP_GPIO0_BASE + GPIO_DATAOUT_OFFSET, val);
        print("Cycle " + i + ": Set HIGH");
        java.lang.Thread.sleep(delayMs);
        // Set all LOW
        val &= ~(GPIO_BITS.GPIO0_8 | GPIO_BITS.GPIO0_9 | GPIO_BITS.GPIO0_11 | GPIO_BITS.GPIO0_6);
        dsMCU1_0.memory.writeWord(0, WKUP_GPIO0_BASE + GPIO_DATAOUT_OFFSET, val);
        print("Cycle " + i + ": Set LOW");
        java.lang.Thread.sleep(delayMs);
    }
    print("Toggle test done.");
}

// ====== Main Entry ======
function main() {
    updateScriptVars();
    setupPinmux();
    setupGPIO_Output();
    toggleGPIOs(10, 200); // 10 cycles, 200ms per state
}

main();
