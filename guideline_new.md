# Hướng dẫn điều khiển GPIO qua Script Console (TI CCS) trên J784S4 EVM

## 1. Tổng quan & Triết lý
- Điều khiển GPIO qua script console giúp kiểm thử nhanh phần cứng, debug, và tự động hóa thao tác mà không cần build firmware mới.
- Script console (JavaScript/CCS Scripting Console) có thể truy cập thanh ghi trực tiếp hoặc gọi API driver nếu firmware đã nạp.

## 2. Kiến trúc liên quan
- J784S4 EVM có nhiều core (A72, R5F, M4), GPIO phân vùng MAIN/WKUP.
- Script console giao tiếp với SoC qua JTAG/XDS110, có thể thao tác thanh ghi hoặc RAM của core.
- Nếu core ở trạng thái "no boot", có thể truy cập thanh ghi trực tiếp; nếu đã nạp firmware, cần đảm bảo không xung đột truy cập.

## 3. Quy trình thực hiện
1. **Kết nối board với CCS/XDS110, mở Scripting Console.**
2. **Đặt core về trạng thái "no boot" (nếu cần truy cập thanh ghi trực tiếp).**
3. **Xác định địa chỉ base/offset của GPIO cần thao tác:**
   - Nếu dùng SDK đầy đủ: tra cứu file `pdk_j784s4_11_02_00_15/packages/ti/drv/gpio/soc/gpio_j784s4.h` hoặc `gpio_soc.h` để lấy mapping địa chỉ GPIO cho J784S4.
   - Nếu chỉ có docs_only: tra cứu địa chỉ thanh ghi GPIO trong Technical Reference Manual (TRM) J784S4, chương GPIO.
   - Best practice: luôn ưu tiên file `gpio_j784s4.h` hoặc `gpio_soc.h` trong driver GPIO của PDK đúng SoC để đảm bảo mapping chuẩn.
4. **Dùng lệnh script để đọc/ghi thanh ghi, ví dụ:**
   ```js
   // Đọc giá trị thanh ghi
   var val = debugSession.memory.readWord(0, 0x00600000);
   // Ghi giá trị để set pin
   debugSession.memory.writeWord(0, 0x00600010, 0x1);
   ```
5. **Nếu muốn dùng API driver, cần nạp firmware có export symbol hoặc dùng GEL script.**

## 4. Lưu ý kỹ thuật nâng cao
- **Latency & Race Condition:** Truy cập trực tiếp thanh ghi có thể gây race nếu firmware cũng thao tác GPIO.
- **Interrupt:** Nếu cần kiểm thử interrupt, phải cấu hình thanh ghi interrupt và handler tương ứng.
- **Thread Safety:** Khi firmware chạy RTOS, cần đảm bảo không xung đột giữa script và task/ISR.
- **Security/Firewall:** Một số peripheral có thể bị khóa bởi DMSC/security, cần mở quyền trước.
- **Debugging:** Có thể dùng script để log trạng thái, test stress, hoặc automate test case.

## 5. Tài liệu tham khảo & script mẫu
- [PDK GPIO User Guide](../ti-processor-sdk-rtos-j784s4-evm-11_02_00_06-docs_only/pdk_j784s4_11_02_00_15/docs/userguide/j784s4/modules/gpio.html)
- [TRM J784S4 GPIO Section]
- [CCS Scripting Console User Guide]
- Script mẫu: Xem thư mục `howto/` hoặc liên hệ TI E2E forum.
