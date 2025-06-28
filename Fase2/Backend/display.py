from RPLCD.i2c import CharLCD
import time
from globals import shared

class Display:

    def __init__(self):
        self.lcd = CharLCD('PCF8574', 0x27)
        self.last_t = 0
        self.enable = True
        self.threshold_data = 0.5  
        self.threshold_message = 0.5
        self.display_index = 0
        self.lcd.clear()
        print("Pantalla LCD inicializada")

<<<<<<< HEAD
=======
    # ============ FUNCIONES ORIGINALES (SENSORES) ============
>>>>>>> Feature/frontend_202001151
    def display_temp(self):
        self.lcd.clear()
        self.lcd.write_string(f"Temp: {shared.temperature:.1f}C")

    def display_humidity(self):
        self.lcd.clear()
        self.lcd.write_string(f"Hum:  {shared.humidity:.1f}%")

    def display_air_quality(self):
        self.lcd.clear()
        self.lcd.write_string(f"AIR:  {shared.air_quality:.1f}ppm")

    def display_light(self):
        self.lcd.clear()
        self.lcd.write_string(f"LUZ:  {shared.light_level:.1f} lux")

    def display_Pressure(self):
        self.lcd.clear()
        self.lcd.write_string(f"Pre:  {shared.pressure:.1f} hpa")

<<<<<<< HEAD
=======
    # ============ FUNCIONES PARA ESTADÍSTICAS ============
    def display_media(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Media: {shared.ultima_media:.2f}")

    def display_mediana(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Mediana: {shared.ultima_mediana:.2f}")

    def display_moda(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Moda: {shared.ultima_moda:.2f}")

    def display_minimo(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Min: {shared.ultimo_minimo:.2f}")

    def display_maximo(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Max: {shared.ultimo_maximo:.2f}")

    def display_desviacion(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Desv: {shared.ultima_desviacion:.2f}")

    def display_varianza(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_estadisticas.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"Var: {shared.ultima_varianza:.2f}")

    # ============ FUNCIONES PARA PREDICCIONES ============
    def display_media_movil(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_predicciones.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"MediaMov: {shared.ultima_media_movil:.2f}")

    def display_suavizado_exponencial(self):
        self.lcd.clear()
        self.lcd.write_string(f"{shared.ultimo_sensor_predicciones.upper()}")
        self.lcd.crlf()
        self.lcd.write_string(f"SuavExp: {shared.ultimo_suavizado_exponencial:.2f}")

    # ============ FUNCIÓN PRINCIPAL DE MENSAJES ============
>>>>>>> Feature/frontend_202001151
    def display_message(self, message):
        self.lcd.clear()
        self.lcd.write_string(message[:16])  # primera línea
        if len(message) > 16:
            self.lcd.crlf()
            self.lcd.write_string(message[16:32])  # segunda línea
<<<<<<< HEAD
        #self.enable = False
        self.last_t = time.time()

=======
        self.last_t = time.time()

    # ============ FUNCIÓN PRINCIPAL UPDATE ============
>>>>>>> Feature/frontend_202001151
    def update(self):
        if not self.enable:
            if time.time() - self.last_t > self.threshold_message:
                self.enable = True
            else:
                return
        else:
            if time.time() - self.last_t < self.threshold_data:
                return

<<<<<<< HEAD
        # Mostrar mensaje de alerta si existe
=======
        # Prioridad 1: Mostrar mensaje de alerta si existe
>>>>>>> Feature/frontend_202001151
        if shared.local_error_message:
            self.display_message(shared.local_error_message)
            shared.local_error_message = ""
            return

<<<<<<< HEAD
        # Lista de funciones de visualización
        display_functions = [
            self.display_temp,
            self.display_humidity,
            self.display_air_quality,
            self.display_light,
            self.display_Pressure,
        ]

        # Mostrar el dato correspondiente
        display_functions[self.display_index % len(display_functions)]()

        # Avanzar al siguiente en la próxima llamada
        self.display_index += 1
        self.last_t = time.time()
=======
        # Prioridad 2: Mostrar según modo seleccionado
        lcd_mode = getattr(shared, 'lcd_mode', 'sensores')  # Default a sensores
        
        if lcd_mode == "estadisticas":
            # Rotar entre todas las estadísticas calculadas
            stats_functions = [
                self.display_media,
                self.display_mediana,
                self.display_moda,
                self.display_minimo,
                self.display_maximo,
                self.display_desviacion,
                self.display_varianza,
            ]
            
            # Verificar que hay datos de estadísticas
            if shared.ultimo_sensor_estadisticas:
                stats_functions[self.display_index % len(stats_functions)]()
            else:
                self.lcd.clear()
                self.lcd.write_string("No hay estadisticas")
                
        elif lcd_mode == "predicciones":
            # Rotar entre predicciones
            pred_functions = [
                self.display_media_movil,
                self.display_suavizado_exponencial,
            ]
            
            # Verificar que hay datos de predicciones
            if shared.ultimo_sensor_predicciones:
                pred_functions[self.display_index % len(pred_functions)]()
            else:
                self.lcd.clear()
                self.lcd.write_string("No hay predicciones")
                
        else:  # lcd_mode == "sensores" (por defecto)
            # Lista de funciones de visualización (comportamiento original)
            display_functions = [
                self.display_temp,
                self.display_humidity,
                self.display_air_quality,
                self.display_light,
                self.display_Pressure,
            ]

            # Mostrar el dato correspondiente
            display_functions[self.display_index % len(display_functions)]()

        # Avanzar al siguiente en la próxima llamada
        self.display_index += 1
        self.last_t = time.time()
>>>>>>> Feature/frontend_202001151
