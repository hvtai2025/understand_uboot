import os
import pty
import serial
import time

def virtual_uart_test():
    # Create a pseudo-terminal pair
    master, slave = pty.openpty()
    slave_name = os.ttyname(slave)
    print(f"Virtual UART slave device: {slave_name}")

    # Open the slave end with pyserial
    ser = serial.Serial(slave_name, baudrate=9600, timeout=1)

    test_message = b"UART_TEST_MESSAGE\n"
    # Write to master (simulating sending from host)
    os.write(master, test_message)
    # Read from slave (simulating device receiving)
    received = ser.readline()
    print(f"Received: {received}")
    assert received == test_message, f"Expected {test_message}, got {received}"

    # Write back from slave (simulating device sending)
    ser.write(test_message)
    # Read from master (simulating host receiving)
    host_received = os.read(master, len(test_message))
    print(f"Host received: {host_received}")
    assert host_received == test_message, f"Expected {test_message}, got {host_received}"

    ser.close()
    print("UART virtual test passed.")

if __name__ == "__main__":
    virtual_uart_test()
