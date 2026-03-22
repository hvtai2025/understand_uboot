# Hướng dẫn sử dụng GPIO để điều khiển LED trên J784S4 (PDK RTOS)

## 1. Triết lý & Gốc rễ
- Điều khiển LED qua GPIO là ví dụ cơ bản nhất để xác nhận khả năng thao tác phần cứng mức thấp trên SoC.
- Sử dụng API chuẩn của PDK giúp mã nguồn portable, dễ bảo trì, không phụ thuộc chi tiết thanh ghi.

## 2. Kiến trúc liên quan
- Ứng dụng RTOS chạy trên R5F/M4
- Sử dụng driver GPIO của PDK
- Board_init() khởi tạo clock, pinmux, GPIO
- GPIO_write() điều khiển trạng thái LED

## 3. Quy trình thực hiện
1. **Khởi tạo board và GPIO:**
   ```c
   Board_init(boardCfg);
   GPIO_init();
   ```
2. **Lặp nhấp nháy LED:**
   ```c
   while(1) {
       GPIO_write(Board_LED1, GPIO_PIN_VAL_HIGH);
       Delay();
       GPIO_write(Board_LED1, GPIO_PIN_VAL_LOW);
       Delay();
   }
   ```
3. **Build & nạp ứng dụng:**
   - Build ví dụ GPIO_LedBlink từ PDK (thường ở: `packages/ti/drv/gpio/test/led_blink`)
   - Nạp file .out lên R5F/M4 qua CCS hoặc script JTAG/XDS110

## 4. Lưu ý kỹ thuật
- Macro `Board_LED1` ánh xạ tới chân GPIO điều khiển LED trên board (xem file board.h của PDK cho đúng mapping).
- Board_init() phải được gọi trước khi dùng GPIO để đảm bảo clock, pinmux đã sẵn sàng.
- Nếu muốn truy cập trực tiếp thanh ghi GPIO, cần xác định đúng địa chỉ base và offset theo TRM.

## 5. Tài liệu tham khảo
- [PDK GPIO User Guide](../ti-processor-sdk-rtos-j784s4-evm-11_02_00_06-docs_only/pdk_j784s4_11_02_00_15/docs/userguide/j784s4/modules/gpio.html)
- [PDK Board Support](../ti-processor-sdk-rtos-j784s4-evm-11_02_00_06-docs_only/pdk_j784s4_11_02_00_15/docs/userguide/j784s4/board/board_support.html)

---
**Nếu cần ví dụ script CCS Scripting Console hoặc truy cập thanh ghi trực tiếp, xem lại các hướng dẫn trước hoặc yêu cầu chi tiết hơn.**
