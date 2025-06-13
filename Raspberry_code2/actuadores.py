from gpiozero import LED, DigitalOutputDevice, PWMOutputDevice, Buzzer
from globals import shared
import threading

class Actuators:

    def __init__(self):
        # LEDs
        self.red_led = LED(17)
        self.yellow_led = LED(22)
        self.green_led = LED(10)
        self.blue_led = LED(9)

        # Motor (puente H)
        self.motor_in1 = DigitalOutputDevice(5)
        self.motor_in2 = DigitalOutputDevice(6)
        self.motor_enable = PWMOutputDevice(13)

        # Buzzer
        self.buzzer = PWMOutputDevice(21)

        # Timers automáticos
        self.auto_off_timers = {}

        self.turn_off_all()
        print("Actuadores inicializados correctamente")

    def turn_off_all(self):
        self.red_led.off()
        self.yellow_led.off()
        self.green_led.on()
        self.blue_led.off()
        self.motor_enable.off()
        self.motor_in1.off()
        self.motor_in2.off()
        self.buzzer.off()
        for key in shared.actuator_status:
            shared.actuator_status[key] = False

    def control_led(self, led_obj, led_name, state):
        if state:
            led_obj.on()
        else:
            led_obj.off()
        shared.actuator_status[led_name] = state

    def control_motor(self, state):
        if state:
            print("Motor ON")
            self.motor_in1.on()
            self.motor_in2.off()
            self.motor_enable.value = 1.0
            shared.actuator_status['motor_fan'] = True
        else:
            print("Motor programado para OFF en 5s")
            self.auto_off_timers['motor'] = threading.Timer(5, self._auto_off_motor)
            self.auto_off_timers['motor'].start()

    def _auto_off_motor(self):
        print("Motor OFF")
        self.motor_enable.off()
        self.motor_in1.off()
        self.motor_in2.off()
        self.control_led(self.red_led, 'red_led', False)
        shared.actuator_status['motor_fan'] = False

    def control_buzzer(self, state):
        if state:
            print("Buzzer ON")
            self.buzzer.frequency = 2000
            self.buzzer.value = 0.5
            shared.actuator_status['buzzer'] = True
        else:
            print("Buzzer programado para OFF en 5s")
            self.auto_off_timers['buzzer'] = threading.Timer(5, self._auto_off_buzzer)
            self.auto_off_timers['buzzer'].start()

    def _auto_off_buzzer(self):
        print("Buzzer OFF")
        self.buzzer.off()
        shared.actuator_status['buzzer'] = False
        self.control_led(self.blue_led, 'blue_led', False)

    def control_iluminacion(self, state):
        if state:
            print("Iluminación ON")
        else:
            print("Iluminación OFF")

    def control_led_yellow(self, state):
        if state:
            self.yellow_led.on()
            print("LED amarillo encendido")
        else:
            print("LED amarillo programado para OFF en 5s")
            self.auto_off_timers['yellow_led'] = threading.Timer(5, self._auto_off_led_yellow)
            self.auto_off_timers['yellow_led'].start()

    def _auto_off_led_yellow(self):
        print("LED amarillo OFF")
        self.control_led(self.yellow_led, 'yellow_led', False)

    def check_alerts_and_control(self):
        auto = shared.modo_control  # True=automático, False=manual

        # --- TEMPERATURA ---
        if shared.temperature > shared.thresholds['temperature_max'] or shared.temperature < shared.thresholds['temperature_min']:
            print(f"Alerta de temperatura: {shared.temperature}°C")
            shared.alert_status['temperature'] = True
            shared.local_error_message = "Temperatura Crítica!"

            if auto:
                # Automático: SIEMPRE activa controladores
                self.control_motor(True)
                self.control_buzzer(True)
                self.control_led(self.red_led, 'red_led', True)
            else:
                # Manual: solo activa si el usuario lo permitió en shared.actuadores
                if shared.actuadores.get("motor_fan", False):
                    self.control_motor(True)
                else:
                    self.control_motor(False)
                if shared.actuadores.get("buzzer", False):
                    self.control_buzzer(True)
                else:
                    self.control_buzzer(False)
                if shared.actuadores.get("red_led", False):
                    self.control_led(self.red_led, 'red_led', True)
                else:
                    self.control_led(self.red_led, 'red_led', False)
        else:
            shared.alert_status['temperature'] = False
            shared.local_error_message = ""
            print(f"Temperatura normalizada: {shared.temperature}°C")
            # Apaga controladores solo en modo automático, en manual depende de switches
            if auto:
                self.control_motor(False)
                self.control_buzzer(False)
                self.control_led(self.red_led, 'red_led', False)
            else:
                # En manual: sigue el estado actual del usuario
                if shared.actuadores.get("motor_fan", False):
                    self.control_motor(True)
                else:
                    self.control_motor(False)
                if shared.actuadores.get("buzzer", False):
                    self.control_buzzer(True)
                else:
                    self.control_buzzer(False)
                if shared.actuadores.get("red_led", False):
                    self.control_led(self.red_led, 'red_led', True)
                else:
                    self.control_led(self.red_led, 'red_led', False)

        # --- HUMEDAD ---
        if shared.humidity > shared.thresholds['humidity_max'] or shared.humidity < shared.thresholds['humidity_min']:
            print(f"Alerta de humedad: {shared.humidity}%")
            shared.alert_status['humidity'] = True
            shared.local_error_message = "Humedad Crítica!"
            if auto:
                self.control_led(self.yellow_led, 'yellow_led', True)
            else:
                if shared.actuadores.get("yellow_led", False):
                    self.control_led(self.yellow_led, 'yellow_led', True)
                else:
                    self.control_led(self.yellow_led, 'yellow_led', False)
        else:
            shared.alert_status['humidity'] = False
            shared.local_error_message = ""
            if auto:
                self.control_led(self.yellow_led, 'yellow_led', False)
            else:
                if shared.actuadores.get("yellow_led", False):
                    self.control_led(self.yellow_led, 'yellow_led', True)
                else:
                    self.control_led(self.yellow_led, 'yellow_led', False)

        # --- LUZ ---
        if shared.light_level < shared.thresholds['light_min']:
            print(f"Alerta por baja luz: {shared.light_level}%")
            shared.alert_status['light'] = True
            shared.local_error_message = "Iluminación Baja!"
            if auto:
                self.control_led(self.green_led, 'green_led', False)
                self.control_iluminacion(True)
            else:
                if shared.actuadores.get("green_led", False):
                    self.control_led(self.green_led, 'green_led', True)
                else:
                    self.control_led(self.green_led, 'green_led', False)
                if shared.actuadores.get("iluminacion", False):
                    self.control_iluminacion(True)
                else:
                    self.control_iluminacion(False)
        else:
            shared.alert_status['light'] = False
            shared.local_error_message = ""
            if auto:
                self.control_led(self.green_led, 'green_led', True)
                self.control_iluminacion(False)
            else:
                if shared.actuadores.get("green_led", False):
                    self.control_led(self.green_led, 'green_led', True)
                else:
                    self.control_led(self.green_led, 'green_led', False)
                if shared.actuadores.get("iluminacion", False):
                    self.control_iluminacion(True)
                else:
                    self.control_iluminacion(False)

        # --- CALIDAD DE AIRE ---
        if shared.air_quality < shared.thresholds['air_quality_min']:
            print(f"Alerta de calidad del aire: {shared.air_quality}")
            shared.alert_status['air_quality'] = True
            shared.local_error_message = "Mala Calidad de Aire!"
            if auto:
                self.control_led(self.blue_led, 'blue_led', True)
                self.control_buzzer(True)
            else:
                if shared.actuadores.get("blue_led", False):
                    self.control_led(self.blue_led, 'blue_led', True)
                else:
                    self.control_led(self.blue_led, 'blue_led', False)
                if shared.actuadores.get("buzzer", False):
                    self.control_buzzer(True)
                else:
                    self.control_buzzer(False)
        else:
            if shared.alert_status['air_quality']:
                print(f"Calidad de Aire normalizada: {shared.air_quality}")
            shared.alert_status['air_quality'] = False
            shared.local_error_message = ""
            if auto:
                self.control_led(self.blue_led, 'blue_led', False)
                self.control_buzzer(False)
            else:
                if shared.actuadores.get("blue_led", False):
                    self.control_led(self.blue_led, 'blue_led', True)
                else:
                    self.control_led(self.blue_led, 'blue_led', False)
                if shared.actuadores.get("buzzer", False):
                    self.control_buzzer(True)
                else:
                    self.control_buzzer(False)

        # --- PRESENCIA ---
        if shared.thresholds['presence_distance_min'] <= shared.distance <= shared.thresholds['presence_distance_max']:
            if not shared.alert_status['presence']:
                print(f"Presencia detectada: {shared.distance}cm")
                shared.alert_status['presence'] = True
        else:
            shared.alert_status['presence'] = False

    def cleanup(self):
        for timer in self.auto_off_timers.values():
            if timer.is_alive():
                timer.cancel()
        self.turn_off_all()
        print("Actuadores limpiados")