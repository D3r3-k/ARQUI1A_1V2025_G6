import board
from datetime import datetime
import adafruit_dht
import busio
import smbus2 as smbus
from gpiozero import DistanceSensor, DigitalInputDevice
from globals import shared

class Sensors:
    def __init__(self):

        self.bus = smbus.SMBus(1)  # I2C bus en Raspberry Pi

        #sensor MQ135
        self.pcf8591_address = 0x48  # Dirección por defecto

        # Sensor DHT11
        self.dht = adafruit_dht.DHT11(board.D4)

        # Sensor ultrasónico
        self.distance_sensor = DistanceSensor(echo=24, trigger=23, max_distance=2.0)

        # LDR digital (sensor de iluminacion)
        self.ldr = DigitalInputDevice(18)

        # BMP280 
        self.BMP_280 = 0x76
        calib = self.bus.read_i2c_block_data(self.BMP_280, 0x88, 24)
        self.dig_T1 = calib[1] << 8 | calib[0]
        self.dig_T2 = self.to_signed(calib[3] << 8 | calib[2], 16)
        self.dig_T3 = self.to_signed(calib[5] << 8 | calib[4], 16)
        self.dig_P1 = calib[7] << 8 | calib[6]
        self.dig_P2 = self.to_signed(calib[9] << 8 | calib[8], 16)
        self.dig_P3 = self.to_signed(calib[11] << 8 | calib[10], 16)
        self.dig_P4 = self.to_signed(calib[13] << 8 | calib[12], 16)
        self.dig_P5 = self.to_signed(calib[15] << 8 | calib[14], 16)
        self.dig_P6 = self.to_signed(calib[17] << 8 | calib[16], 16)
        self.dig_P7 = self.to_signed(calib[19] << 8 | calib[18], 16)
        self.dig_P8 = self.to_signed(calib[21] << 8 | calib[20], 16)
        self.dig_P9 = self.to_signed(calib[23] << 8 | calib[22], 16)

        self.bus.write_byte_data(self.BMP_280, 0xF4, 0x3F)
        self.bus.write_byte_data(self.BMP_280, 0xF5, 0x14)
        
    
        print("Sensores inicializados correctamente")

    def to_signed(self, val, bits):
        if val & (1 << (bits - 1)):
            return val - (1 << bits)
        return val
    
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
            # Leer el canal A1 (0x41) del PCF8591
            self.bus.write_byte(self.pcf8591_address, 0x41)
            self.bus.read_byte(self.pcf8591_address)  # Dummy read
            value = self.bus.read_byte(self.pcf8591_address)

            # Convertir a voltaje (3.3V referencia)
            Vref = 3.3
            Vout = (value / 255.0) * Vref

            # Calcular resistencia del LDR (en ohms)
            RL = 10000  # ohmios
            if Vout == 0:
                lux = 0
            else:
                R_ldr = RL * (Vref - Vout) / Vout  # en ohmios
                R_ldr_k = R_ldr / 1000.0  # convertir a kΩ

                # Fórmula empírica para estimar luxes
                A = 500
                B = 1.4
                lux = (value / 255.0) * 1000 

            shared.light_level = round(lux, 2)
            print(f"ADC value: {value} | Vout: {Vout:.2f} V | Lux: {lux:.2f}")


        except Exception as e:
            print(f"Error leyendo luz en luxes: {e}")


    def read_pressure_sensor(self):
        try:
            data = self.bus.read_i2c_block_data(self.BMP_280, 0xF7, 6)
            adc_p = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
            adc_t = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4)

            var1 = (((adc_t >> 3) - (self.dig_T1 << 1)) * self.dig_T2) >> 11
            var2 = (((((adc_t >> 4) - self.dig_T1) * ((adc_t >> 4) - self.dig_T1)) >> 12) * self.dig_T3) >> 14
            t_fine = var1 + var2
            temp = (t_fine * 5 + 128) >> 8
            shared.bmp_temp = round(temp / 100.0, 2)

            var1 = t_fine - 128000
            var2 = var1 * var1 * self.dig_P6
            var2 += ((var1 * self.dig_P5) << 17)
            var2 += (self.dig_P4 << 35)
            var1 = ((var1 * var1 * self.dig_P3) >> 8) + ((var1 * self.dig_P2) << 12)
            var1 = (((1 << 47) + var1) * self.dig_P1) >> 33

            if var1 == 0:
                return

            p = 1048576 - adc_p
            p = ((p << 31) - var2) * 3125 // var1
            var1 = (self.dig_P9 * (p >> 13) * (p >> 13)) >> 25
            var2 = (self.dig_P8 * p) >> 19
            p = ((p + var1 + var2) >> 8) + (self.dig_P7 << 4)

            shared.pressure = round(p / 25600.0, 2)
    

        except Exception as e:
            print(f"Error leyendo presión BMP280: {e}")

    def read_air_quality(self):
        try:
            # Leer 2 veces por requisitos del PCF8591
            self.bus.write_byte(self.pcf8591_address, 0x40)  # Canal A0
            self.bus.read_byte(self.pcf8591_address)  # Dummy read
            value = self.bus.read_byte(self.pcf8591_address)  # Valor real (0–255)
            
            Vout = (value / 255.0) * 3.3  # Voltaje real en V
            Vcc = 5.0  # Voltaje de alimentación
            RL = 10000  # 10kΩ

            # Calcular Rs (resistencia del sensor)
            Rs = RL * (Vcc / Vout - 1)

            # Calibración: Rs en aire limpio. Debes obtenerlo tú y reemplazarlo aquí
            R0 = 10000  # Ejemplo: debes calibrarlo manualmente en aire limpio

            # Relación Rs/R0
            ratio = Rs / R0

            # Estimación de ppm (puedes cambiar a y b según el gas que te interese)
            a = 116.6020682
            b = 2.769034857
            ppm = a * (ratio ** -b)

            shared.air_quality = round(ppm, 2)

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
            f"Light: {shared.light_level}lux | "
            f"Pressure: {shared.pressure:.1f}hPa | "
            f"Air Quality: {shared.air_quality}")

    def cleanup(self):
        try:
            self.distance_sensor.close()
            self.ldr.close()
            print("Sensores limpiados")
        except Exception as e:
            print(f"Error cerrando sensores: {e}")

    def apply_remote_commands(self):
        for device, action in shared.remote_commands.items():
            # Acciones booleanas
            state = action.lower() == "on"

            if device == "buzzer":
                self.control_buzzer(state)
            elif device == "motor_fan":
                self.control_motor(state)
            elif device == "red_led":
                self.control_led(self.red_led, "red_led", state)
            elif device == "yellow_led":
                self.control_led(self.yellow_led, "yellow_led", state)
            elif device == "green_led":
                self.control_led(self.green_led, "green_led", state)
            elif device == "blue_led":
                self.control_led(self.blue_led, "blue_led", state)
            else:
                print(f"Dispositivo desconocido: {device}")

        # Limpia los comandos después de ejecutarlos
        shared.remote_commands.clear()

