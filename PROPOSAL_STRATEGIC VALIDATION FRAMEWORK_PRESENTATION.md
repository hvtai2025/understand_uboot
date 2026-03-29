---
marp: true
theme: default
paginate: true
header: 'Automotive Chiplet Validation Strategy'
footer: 'Proprietary & Confidential - Validation Lead'
---

# Strategic Validation Framework
## Automotive Chiplet (AC) Integration
**Platform:** TI TDA5 (Jacinto 7 Architecture)
**Objective:** Minimum Effort Bring-up & System Reliability

---

# 1. Executive Summary

- **The Challenge:** First-of-its-kind Chiplet project with "Black-box" internal die functions.
- **The Philosophy:** Shift focus from *Die-internal* to *Inter-die Connectivity*.
- **The Goal:** Build a **Lean Framework** to reach a working Linux prototype in record time.
- **Business Value:** Early risk detection (Shift-Left) and scalable automation.

---

# 2. The "Gatekeeper" Bring-up Model

*We avoid "debugging in the dark" by implementing a strict entry-gate:*

1. **JTAG Sanity (5 Mins):** Verify Power, Clock, and Device IDs.
2. **Link Validation:** Confirm UCIe Link Training between Dies.
3. **U-Boot/SPL:** Execute DDR Training & Multi-core Handover.
4. **Linux Kernel:** High-level functional and Stress testing.

---

# 3. Validation Architecture

A 4-layer modular approach to decouple Hardware from Logic:

- **Layer 1: HAL (Hardware Access)**
  - JTAG, UART, PCIe Drivers.
- **Layer 2: Resource Manager**
  - TI-SCI (DMSC) Control & Power/Clock management.
- **Layer 3: Scenario Engine**
  - Pytest-based BDD Logic & Test Sequences.
- **Layer 4: Analytics**
  - Log Parser & Automated Reporting.

---

# 4. Critical Technical Focus Areas

| Area | Method | Key Objective |
| :--- | :--- | :--- |
| **Connectivity** | JTAG / Reg Access | Pinmux, PADCONFIG, UCIe Link. |
| **Boot Flow** | UART / PC Trace | R5 SPL to A72 SPL Handshake. |
| **Isolation** | Negative Testing | Firewall (MSMC) & Domain Lock. |
| **Stability** | Linux Stress-ng | DDR & UCIe Thermal Stability. |

---

# 5. Strategic Inputs Required (From Arch/Design)

To ensure success, the following "Draft" data must be finalized:

- **System Memory Map:** Inter-die address space (Coherent/Non-coherent).
- **TI-SCI Protocol Specs:** List of Device & Clock IDs for DMSC control.
- **Firewall Matrix:** Definition of PrivIDs and access permissions.
- **Reset Topology:** Power-on sequence timing diagram.

---

# 6. Root Cause Analysis (RCA) Kit

*Protecting the team from "Blame-games" when the board fails to boot:*

- **Automated JTAG Scripts:** Instant scan of Boot Mode Pins and Rails.
- **Golden Snapshots:** Compare actual Silicon state vs. Design Specs.
- **Handshake Monitor:** Traps TI-SCI messages to locate boot "hangs."
- **Tier 1 Acceptance:** ODM must verify Power/Clock before delivery.

---

# 7. Responsibility Matrix (RACI)

| Task | Validation | Design | Tier 1/ODM | Manager |
| :--- | :---: | :---: | :---: | :---: |
| Build Framework | **R** | C | I | A |
| Provide Reg Maps | I | **R** | C | - |
| HW Acceptance | C | I | **R** | A |
| Boot RCA | **R** | C | C | I |

---

# 8. Conclusion & Next Steps

**Value Proposition:**
- **70% Reduction** in manual debug time.
- **Instant Detection** of soldering or silicon connectivity issues.

**Immediate Actions:**
1. Approve **JTAG Sanity Script** development.
2. Formally request **SoC Memory Map** from Architecture.
3. Define **Acceptance Criteria** for Tier 1/ODM delivery.

---

# Strategic Validation Framework
## High-Performance Automotive Chiplet (AC)
**Platform:** TI TDA5 (Jacinto 7 Architecture)
**Lead:** Validation Lead
**Objective:** Maximum Efficiency via Lean Bring-up

---

# 9. The Strategy Mind Map
---

![bg contain 80%](mm.png)

---

# 10. The Gatekeeper Checklist

| Sequence | Checkpoint | Failure Impact |
| :--- | :--- | :--- |
| **1. Power** | Voltage Rail Status | Board remains "Dead" / No JTAG access. |
| **2. Clock** | PLL Lock & Frequency | System Hang or Asynchronous bus errors. |
| **3. Link** | UCIe Physical Training | **Critical:** No data transfer between Dies. |
| **4. Map** | PADCONFIG / Pinmux | No UART Log or Boot device access. |
| **5. Core** | PC (Program Counter) | CPU stuck in ROM or Bootloader crash. |


**Goal:** Identify Hardware/Silicon "Showstoppers" before OS-level debug.

---

# Q&A

### Thank you for your time.

