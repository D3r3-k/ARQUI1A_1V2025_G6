import board
import time
import adafruit_dht
import busio
from gpiozero import DistanceSensor, DigitalInputDevice
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn
from globals import shared

class Sensors:
    def __init__(self):
        # I2C para BMP280 y ADS1115
        i2c = busio.I2C(board.SCL, board.SDA)

        # Inicializar ADC ADS1115
        self.ads = ADS1115(i2c)

        # Canal A1 del ADS1115 para MQ135
        self.mq135_channel = AnalogIn(self.ads, ADS1115.P1)

        # Sensor DHT11 (temperatura y humedad)
        self.dht = adafruit_dht.DHT11(board.D4)

        # Sensor Ultrasónico HC-SR04
        self.distance_sensor = DistanceSensor(echo=24, trigger=23, max_distance=2.0)

        # Sensor de luz (LDR digital)
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
            # Puedes descomentar esta línea si decides usar BMP280 más adelante
            # shared.pressure = round(self.bmp280.pressure, 2)
            pass
        except Exception as e:
            print(f"Error leyendo presión BMP280: {e}")

    def read_air_quality(self):
        try:
            voltage = self.mq135_channel.voltage  # Ej: 1.55 V
            shared.air_quality = round((voltage / 3.3) * 500, 2)  # Escala a 0–500
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
        try:
            self.distance_sensor.close()
            self.ldr.close()
            print("Sensores limpiados")
        except Exception as e:
            print(f"Error cerrando sensores: {e}")
