import board
import time
import random
import adafruit_dht
import adafruit_bmp280
import busio
from gpiozero import DistanceSensor, DigitalInputDevice
from mq135_reader import MQ135Reader  # si lo separas a otro archivo
from adafruit_ads1x15.ads1115 import ADS1115


from adafruit_ads1x15.analog_in import AnalogIn
from globals import shared

class Sensors:
    def __init__(self):
        # I2C para BMP280 y ADS1115
        i2c = busio.I2C(board.SCL, board.SDA)

        # BMP280 (presión y temperatura)
        #self.bmp280 = adafruit_bmp280.Adafruit_BMP280_I2C(i2c, address=0x76)

        # ADS1115 para MQ135
        self.ads = ADS1115(i2c)

        self.mq135 = MQ135Reader(ads=self.ads, channel=1)  # AIN1



        # Sensor DHT11
        self.dht = adafruit_dht.DHT11(board.D4)

        # Sensor Ultrasónico
        self.distance_sensor = DistanceSensor(echo=24, trigger=23, max_distance=2.0)

        # Sensor LDR digital
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
           # shared.pressure = round(self.bmp280.pressure, 2)
            print(f"Error leyendo presión BMP280: {e}")
        except Exception as e:
            print(f"Error leyendo presión BMP280: {e}")

    def read_air_quality(self):
        try:
            # MQ135 entrega valores analógicos. ADC da voltaje entre 0–3.3V aprox
            voltage = self.mq135.read()
            shared.air_quality = voltage
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
