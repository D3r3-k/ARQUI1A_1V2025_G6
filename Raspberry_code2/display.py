from RPLCD.i2c import CharLCD
import time
from globals import shared

class Display:

    def __init__(self):
        # PCF8574 en dirección I2C 0x27 
        self.lcd = CharLCD('PCF8574', 0x27)
        self.last_t = 0
        self.enable = True
        self.threshold_data = 0.5
        self.threshold_message = 5.0
        self.lcd.clear()
        print("Pantalla LCD inicializada")

    def display_data(self):
        """Muestra temperatura y humedad"""
        self.lcd.clear()
        self.lcd.write_string(f"Temp: {shared.temperature:.1f}C")
        self.lcd.crlf()
        self.lcd.write_string(f"Hum:  {shared.humidity:.1f}%")
        self.last_t = time.time()
        self.lcd.write_string(f"AIR:  {shared.air_quality:.1f}")
        self.last_t = time.time()

    def display_message(self, message):
        """Muestra mensaje personalizado por unos segundos"""
        self.lcd.clear()
        self.lcd.write_string(message[:16])  # primera línea
        if len(message) > 16:
            self.lcd.crlf()
            self.lcd.write_string(message[16:32])  # segunda línea
        self.enable = False
        self.last_t = time.time()

    def update(self):
        """Actualiza el contenido de la pantalla"""
        if not self.enable:
            if time.time() - self.last_t > self.threshold_message:
                self.enable = True
            else:
                return
        else:
            if time.time() - self.last_t < self.threshold_data:
                return

        if shared.local_error_message:
            self.display_message(shared.local_error_message)
            shared.local_error_message = ""
        else:
            self.display_data()
