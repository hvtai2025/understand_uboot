import serial
import time

def real_serial_test(port="/dev/ttyUSB8", baudrate=115200, test_command="memtest001"):
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        print(f"Opened serial port: {port} at {baudrate} baud")
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        
        # Send test command
        ser.write((test_command + "\n").encode())
        print(f"Sent: {test_command}")
        time.sleep(0.5)
        
        # Read response
        response = ser.readline().decode(errors="ignore").strip()
        print(f"Received: {response}")
        
        if response:
            print("Serial test PASS.")
        else:
            print("Serial test FAIL: No response.")
        ser.close()
    except Exception as e:
        print(f"Serial test FAIL: {e}")

if __name__ == "__main__":
    real_serial_test()
