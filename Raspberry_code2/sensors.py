from gpiozero import DigitalInputDevice, DistanceSensor
import adafruit_dht
import board
import time
import random
from globals import shared

class Sensors:
    """
    Lectura de sensores usando gpiozero y adafruit_dht.

    """

    def __init__(self):
        # Sensor DHT11 en GPIO4 (pin físico 7)
        self.dht = adafruit_dht.DHT11(board.D4)

        # HC-SR04 en GPIO 23 (TRIG) y 24 (ECHO)
        self.distance_sensor = DistanceSensor(echo=24, trigger=23, max_distance=2.0)

        # MQ135 D0 en GPIO27 (pin físico 13) ← CAMBIADO
        self.mq135 = DigitalInputDevice(27)

        # LDR en GPIO18
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
            shared.pressure = round(random.uniform(1000, 1020), 2)
        except Exception as e:
            print(f"Error simulando presión: {e}")

    def read_air_quality(self):
        try:
            shared.air_quality = 400 if self.mq135.value == 1 else 100
        except Exception as e:
            print(f"Error leyendo MQ135: {e}")

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
        # Liberar correctamente los recursos de los sensores gpiozero
        try:
            self.mq135.close()
            self.ldr.close()
            self.distance_sensor.close()
            print("Sensores gpiozero cerrados correctamente")
        except Exception as e:
            print(f"Error cerrando sensores: {e}")
