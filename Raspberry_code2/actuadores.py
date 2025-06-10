from gpiozero import LED, DigitalOutputDevice, Buzzer
from globals import shared
import threading

class Actuators:


    def __init__(self):
        # Declaracion de LED's
        self.red_led = LED(17)
        self.yellow_led = LED(22)
        self.green_led = LED(10)
        self.blue_led = LED(9)

        # Declaracion de Buzzer y Motor 
        self.motor = DigitalOutputDevice(20) # 13,19,26
        self.buzzer = Buzzer(21)


        self.auto_off_timers = {}

        self.turn_off_all()
        print("Actuadores inicializados Correctamente")

    def turn_off_all(self):
        self.red_led.off()
        self.yellow_led.off()
        self.green_led.off()
        self.blue_led.off()
        self.motor.off()
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
            self.motor.on()
        else:
            self.motor.off()
        shared.actuator_status['motor_fan'] = state

        if state:
            if 'motor' in self.auto_off_timers:
                self.auto_off_timers['motor'].cancel()
            self.auto_off_timers['motor'] = threading.Timer(
                5.0, self._auto_off_motor
            )
            self.auto_off_timers['motor'].start()

    def _auto_off_motor(self):
        self.motor.off()
        shared.actuator_status['motor_fan'] = False
        print("Motor apagado automáticamente")

    def control_buzzer(self, state, duration=2.0):
        if state:
            self.buzzer.on()
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

    def check_alerts_and_control(self):
        if shared.temperature > shared.thresholds['temperature_max'] or shared.temperature < shared.thresholds['temperature_min']:
            if not shared.alert_status['temperature']:
                print(f"  Alerta de temperatura: {shared.temperature}°C")
                self.control_led(self.red_led, 'red_led', True)
                shared.alert_status['temperature'] = True
                shared.local_error_message = "Temp Alert!"
                if shared.temperature > shared.thresholds['temperature_max']:
                    self.control_motor(True)
        else:
            shared.alert_status['temperature'] = False

        if shared.humidity > shared.thresholds['humidity_max'] or shared.humidity < shared.thresholds['humidity_min']:
            if not shared.alert_status['humidity']:
                print(f"  Alerta de humedad: {shared.humidity}%")
                self.control_led(self.yellow_led, 'yellow_led', True)
                shared.alert_status['humidity'] = True
                shared.local_error_message = "Humidity Alert!"
        else:
            shared.alert_status['humidity'] = False

        if shared.light_level < shared.thresholds['light_min']:
            if not shared.alert_status['light']:
                print(f" Alerta por baja luz: {shared.light_level}%")
                self.control_led(self.green_led, 'green_led', True)
                shared.alert_status['light'] = True
                shared.local_error_message = "Low Light!"
        else:
            shared.alert_status['light'] = False

        if shared.air_quality > shared.thresholds['air_quality_max']:
            if not shared.alert_status['air_quality']:
                print(f"  Alerta de calidad del aire: {shared.air_quality}")
                self.control_led(self.blue_led, 'blue_led', True)
                self.control_buzzer(True, 3.0)
                shared.alert_status['air_quality'] = True
                shared.local_error_message = "Bad Air Quality!"
        else:
            shared.alert_status['air_quality'] = False

        if shared.distance < shared.thresholds['presence_distance']:
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
