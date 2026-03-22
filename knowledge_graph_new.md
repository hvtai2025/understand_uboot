# Knowledge Graph: GPIO & Script Console trên J784S4

```mermaid
graph TD
    PC --runs--> CCS/Script
    CCS/Script --JTAG--> XDS110
    XDS110 --accesses--> SoC
    SoC --has--> MAIN_GPIO
    SoC --has--> WKUP_GPIO
    MAIN_GPIO --mapped_by--> TRM/soc.h
    WKUP_GPIO --mapped_by--> TRM/soc.h
    CCS/Script --read/write--> GPIO_Registers
    GPIO_Registers --controls--> LED/Peripheral
    SoC --protected_by--> DMSC/Security
    CCS/Script --can_configure--> Interrupts
    Firmware --may_conflict_with--> Script_Access
```

## Thành phần chính & mối liên hệ
- **CCS Script Console:** Công cụ điều khiển, truy cập thanh ghi, automate test.
- **JTAG/XDS110:** Cầu nối vật lý giữa PC và SoC.
- **GPIO Registers:** Địa chỉ xác định qua TRM, thao tác trực tiếp hoặc qua driver.
- **Firmware/RTOS:** Có thể gây race nếu cùng truy cập GPIO.
- **Security/Firewall:** Có thể cần mở quyền peripheral trước khi truy cập.

## Best Practice cho Senior
- Luôn kiểm tra trạng thái core trước khi thao tác thanh ghi.
- Sử dụng script để automate test, log, hoặc stress test GPIO.
- Nếu cần kiểm thử interrupt, phải cấu hình đầy đủ vector và mask.
- Đảm bảo không xung đột với firmware đang chạy (dùng mutex hoặc thao tác khi core idle).
- Ghi chú lại mapping địa chỉ, version TRM, và script mẫu để tái sử dụng.
