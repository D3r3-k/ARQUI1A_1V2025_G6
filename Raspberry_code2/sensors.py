import board
import time
import adafruit_dht
import busio
import smbus
from gpiozero import DistanceSensor, DigitalInputDevice
from globals import shared

class Sensors:
    def __init__(self):
        self.bus = smbus.SMBus(1)  # I2C bus en Raspberry Pi
        self.pcf8591_address = 0x48  # Dirección por defecto

        # Sensor DHT11
        self.dht = adafruit_dht.DHT11(board.D4)

        # Sensor ultrasónico
        self.distance_sensor = DistanceSensor(echo=24, trigger=23, max_distance=2.0)

        # LDR digital
        self.ldr = DigitalInputDevice(18)

        print("Sensores inicializados correctamente")

    def read_dht11(self):
        try:
            shared.temperature = float(self.dht.temperature)
            shared.humidity = float(self.dht.humidity)
        except Exception as e:
            print(f"Error leyendo DHT11: {e}")

    def read_ultrasonic(self):
        try:
            distance_m = self.distance_sensor.distance
            shared.distance = round(distance_m * 100, 2)
        except Exception as e:
            print(f"Error leyendo distancia ultrasónica: {e}")

    def read_light_sensor(self):
        try:
            shared.light_level = 0 if self.ldr.value == 1 else 100
        except Exception as e:
            print(f"Error leyendo luz: {e}")

    def read_pressure_sensor(self):
        try:
            # Si usas BMP280, puedes agregarlo aquí luego
            pass
        except Exception as e:
            print(f"Error leyendo presión BMP280: {e}")

    def read_air_quality(self):
        try:
            # Leer 2 veces por requerimientos del PCF8591
            self.bus.write_byte(self.pcf8591_address, 0x40)  # Canal A0
            self.bus.read_byte(self.pcf8591_address)  # Dummy read
            value = self.bus.read_byte(self.pcf8591_address)  # Valor real (0–255)
            voltage = (value / 255.0) * 3.3
            shared.air_quality = round((voltage / 3.3) * 500, 2)
        except Exception as e:
            print(f"Error leyendo MQ135 desde PCF8591: {e}")

    def read_sensors(self):
        self.read_dht11()
        self.read_ultrasonic()
        self.read_light_sensor()
        self.read_pressure_sensor()
        self.read_air_quality()

    def print_data(self):
        print(f"Temp: {shared.temperature:.1f}°C | "
              f"Humidity: {shared.humidity:.1f}% | "
              f"Distance: {shared.distance:.1f}cm | "
              f"Light: {shared.light_level}% | "
              f"Pressure: {shared.pressure:.1f}hPa | "
              f"Air Quality: {shared.air_quality}")

    def cleanup(self):
        try:
            self.distance_sensor.close()
            self.ldr.close()
            print("Sensores limpiados")
        except Exception as e:
            print(f"Error cerrando sensores: {e}")
