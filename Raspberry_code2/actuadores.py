from gpiozero import LED, DigitalOutputDevice, PWMOutputDevice, Buzzer
from globals import shared
import threading

class Actuators:

    def __init__(self):
        # Declaración de LEDs
        self.red_led = LED(17)
        self.yellow_led = LED(22)
        self.green_led = LED(10)
        self.blue_led = LED(9)

        # Declaración del motor con puente H
        self.motor_in1 = DigitalOutputDevice(5)     # IN1
        self.motor_in2 = DigitalOutputDevice(6)     # IN2
        self.motor_enable = PWMOutputDevice(13)     # EN (PWM)

        # Buzzer
        self.buzzer = PWMOutputDevice(21)   

        # Diccionario para timers automáticos
        self.auto_off_timers = {}

        self.turn_off_all()
        print("Actuadores inicializados Correctamente")
        self.normal_off_timers = {}; 

    def turn_off_all(self):
        self.red_led.off()
        self.yellow_led.off()
        self.green_led.off()
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

        if state:
            if led_name in self.auto_off_timers:
                self.auto_off_timers[led_name].cancel()
            self.auto_off_timers[led_name] = threading.Timer(
                5.0, self._auto_off_led, [led_obj, led_name]
            )
            self.auto_off_timers[led_name].start()

    def _auto_off_led(self, led_obj, led_name):
        led_obj.off()
        shared.actuator_status[led_name] = False
        print(f"{led_name} apagado automáticamente")

    def control_motor(self, state):
        if state:
            self.motor_in1.on()
            self.motor_in2.off()  # dirección fija
            self.motor_enable.value = 1.0  # 100% velocidad
            shared.actuator_status['motor_fan'] = True

            if 'motor' in self.auto_off_timers:
                self.auto_off_timers['motor'].cancel()
            self.auto_off_timers['motor'] = threading.Timer(
                5.0, self._auto_off_motor
            )
            self.auto_off_timers['motor'].start()
        else:
            self._auto_off_motor()

    def _auto_off_motor(self):
        self.motor_enable.off()
        self.motor_in1.off()
        self.motor_in2.off()
        shared.actuator_status['motor_fan'] = False
        print("Motor apagado automáticamente")

    def control_buzzer(self, state, duration=2.0):
        if state:
            self.buzzer.frequency = 2000  # 2kHz es común para buzzers pasivos
            self.buzzer.value = 0.5       # ciclo de trabajo del 50%

            shared.actuator_status['buzzer'] = True
            timer = threading.Timer(duration, self._auto_off_buzzer)
            timer.start()
        else:
            self.buzzer.off()
            shared.actuator_status['buzzer'] = False

    def _auto_off_buzzer(self):
        self.buzzer.off()
        shared.actuator_status['buzzer'] = False
        print("Buzzer apagado automáticamente")

    def _turn_off_temperature_alert(self):
        self.control_led(self.red_led, 'red_led', False)
        self.control_motor(False)
        print("Actuadores de temperatura apagados tras normalización")


    def check_alerts_and_control(self):
        if shared.temperature > shared.thresholds['temperature_max'] or shared.temperature < shared.thresholds['temperature_min']:
            if not shared.alert_status['temperature']:
                print(f"  Alerta de temperatura: {shared.temperature}°C")
                self.control_led(self.red_led, 'red_led', True)
                shared.alert_status['temperature'] = True
                shared.local_error_message = "Temperatura Critica!"
                if shared.temperature > shared.thresholds['temperature_max']:
                    self.control_motor(True)
        else:
            if shared.alert_status['temperature']:
    
                if 'temperature' in self.normal_off_timers:
                    self.normal_off_timers['temperature'].cancel()

                self.normal_off_timers['temperature'] = threading.Timer(
                    5.0, self._turn_off_temperature_alert
                )
                self.normal_off_timers['temperature'].start()

            shared.alert_status['temperature'] = False


        if shared.humidity > shared.thresholds['humidity_max'] or shared.humidity < shared.thresholds['humidity_min']:
            if not shared.alert_status['humidity']:
                print(f"  Alerta de humedad: {shared.humidity}%")
                self.control_led(self.yellow_led, 'yellow_led', True)
                shared.alert_status['humidity'] = True
                shared.local_error_message = "Humedad Critica!"
        else:
            shared.alert_status['humidity'] = False

        if shared.light_level < shared.thresholds['light_min']:
            if not shared.alert_status['light']:
                print(f" Alerta por baja luz: {shared.light_level}%")
                self.control_led(self.green_led, 'green_led', True)
                shared.alert_status['light'] = True
                shared.local_error_message = "Iluminacion Baja!"
        else:
            shared.alert_status['light'] = False

        if shared.air_quality > shared.thresholds['air_quality_max']:
            if not shared.alert_status['air_quality']:
                print(f"  Alerta de calidad del aire: {shared.air_quality}")
                self.control_led(self.blue_led, 'blue_led', True)
                self.control_buzzer(True, 3.0)
                shared.alert_status['air_quality'] = True
                shared.local_error_message = "Mala Calidad de Aire!"
        else:
            shared.alert_status['air_quality'] = False

        if shared.thresholds['presence_distance_min'] <= shared.distance <= shared.thresholds['presence_distance_max']:

            if not shared.alert_status['presence']:
                print(f" Presencia detectada: {shared.distance}cm")
                shared.alert_status['presence'] = True
        else:
            shared.alert_status['presence'] = False

    def cleanup(self):
        for timer in self.auto_off_timers.values():
            if timer.is_alive():
                timer.cancel()
        self.turn_off_all()
        print("Actuadores limpiados")
