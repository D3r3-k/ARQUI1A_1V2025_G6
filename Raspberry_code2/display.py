from RPLCD.i2c import CharLCD
import time
from globals import shared

class Display:

    def __init__(self):
        self.lcd = CharLCD('PCF8574', 0x27)
        self.last_t = 0
        self.enable = True
        self.threshold_data = 0.5  
        self.threshold_message = 5.0
        self.display_index = 0
        self.lcd.clear()
        print("Pantalla LCD inicializada")

    def display_temp(self):
        self.lcd.clear()
        self.lcd.write_string(f"Temp: {shared.temperature:.1f}C")

    def display_humidity(self):
        self.lcd.clear()
        self.lcd.write_string(f"Hum:  {shared.humidity:.1f}%")

    def display_air_quality(self):
        self.lcd.clear()
        self.lcd.write_string(f"AIR:  {shared.air_quality:.1f}")

    def display_message(self, message):
        self.lcd.clear()
        self.lcd.write_string(message[:16])  # primera línea
        if len(message) > 16:
            self.lcd.crlf()
            self.lcd.write_string(message[16:32])  # segunda línea
        self.enable = False
        self.last_t = time.time()

    def update(self):
        if not self.enable:
            if time.time() - self.last_t > self.threshold_message:
                self.enable = True
            else:
                return
        else:
            if time.time() - self.last_t < self.threshold_data:
                return

        # Mostrar mensaje de alerta si existe
        if shared.local_error_message:
            self.display_message(shared.local_error_message)
            shared.local_error_message = ""
            return

        # Lista de funciones de visualización
        display_functions = [
            self.display_temp,
            self.display_humidity,
            self.display_air_quality
        ]

        # Mostrar el dato correspondiente
        display_functions[self.display_index % len(display_functions)]()

        # Avanzar al siguiente en la próxima llamada
        self.display_index += 1
        self.last_t = time.time()
