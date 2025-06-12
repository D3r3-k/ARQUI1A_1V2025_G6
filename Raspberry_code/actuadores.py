import time
import threading
import RPi.GPIO as GPIO
from globals import shared

class Actuators:
    """
    Actuators class for controlling output devices based on sensor readings.
    Controls:
    - LEDs: Red (temp), Yellow (humidity), Green (light), Blue (air quality)
    - Motor/Fan: For temperature control
    - Buzzer: For audio alerts
    """
    
    def __init__(self):
        # GPIO pins for actuators
        self.RED_LED = 17      # Temperature alert
        self.YELLOW_LED = 22   # Humidity alert
        self.GREEN_LED = 10    # Light alert
        self.BLUE_LED = 9      # Air quality alert
        self.MOTOR_PIN = 20    # Fan/Motor
        self.BUZZER_PIN = 21   # Buzzer
        
        # Setup GPIO pins as outputs
        GPIO.setup(self.RED_LED, GPIO.OUT)
        GPIO.setup(self.YELLOW_LED, GPIO.OUT)
        GPIO.setup(self.GREEN_LED, GPIO.OUT)
        GPIO.setup(self.BLUE_LED, GPIO.OUT)
        GPIO.setup(self.MOTOR_PIN, GPIO.OUT)
        GPIO.setup(self.BUZZER_PIN, GPIO.OUT)
        
        # Initialize all actuators to OFF
        self.turn_off_all()
        
        # Timer for auto-off functionality (5 seconds delay)
        self.auto_off_timers = {}
        
        print("Actuators initialized successfully")
    
    def turn_off_all(self):
        """Turn off all actuators"""
        GPIO.output(self.RED_LED, GPIO.LOW)
        GPIO.output(self.YELLOW_LED, GPIO.LOW)
        GPIO.output(self.GREEN_LED, GPIO.LOW)
        GPIO.output(self.BLUE_LED, GPIO.LOW)
        GPIO.output(self.MOTOR_PIN, GPIO.LOW)
        GPIO.output(self.BUZZER_PIN, GPIO.LOW)
        
        # Update status
        for key in shared.actuator_status:
            shared.actuator_status[key] = False
    
    def control_led(self, led_pin, led_name, state):
        """Control individual LED with auto-off timer"""
        GPIO.output(led_pin, GPIO.HIGH if state else GPIO.LOW)
        shared.actuator_status[led_name] = state
        
        if state:  # If turning ON, set auto-off timer
            if led_name in self.auto_off_timers:
                self.auto_off_timers[led_name].cancel()
            
            self.auto_off_timers[led_name] = threading.Timer(
                5.0, self._auto_off_led, [led_pin, led_name]
            )
            self.auto_off_timers[led_name].start()
    
    def _auto_off_led(self, led_pin, led_name):
        """Auto turn off LED after delay"""
        GPIO.output(led_pin, GPIO.LOW)
        shared.actuator_status[led_name] = False
        print(f"{led_name} auto turned off")
    
    def control_motor(self, state):
        """Control motor/fan with auto-off timer"""
        GPIO.output(self.MOTOR_PIN, GPIO.HIGH if state else GPIO.LOW)
        shared.actuator_status['motor_fan'] = state
        
        if state:  # If turning ON, set auto-off timer
            if 'motor' in self.auto_off_timers:
                self.auto_off_timers['motor'].cancel()
            
            self.auto_off_timers['motor'] = threading.Timer(
                5.0, self._auto_off_motor
            )
            self.auto_off_timers['motor'].start()
    
    def _auto_off_motor(self):
        """Auto turn off motor after delay"""
        GPIO.output(self.MOTOR_PIN, GPIO.LOW)
        shared.actuator_status['motor_fan'] = False
        print("Motor auto turned off")
    
    def control_buzzer(self, state, duration=2.0):
        """Control buzzer with specified duration"""
        if state:
            GPIO.output(self.BUZZER_PIN, GPIO.HIGH)
            shared.actuator_status['buzzer'] = True
            
            # Auto turn off after duration
            buzzer_timer = threading.Timer(duration, self._auto_off_buzzer)
            buzzer_timer.start()
        else:
            GPIO.output(self.BUZZER_PIN, GPIO.LOW)
            shared.actuator_status['buzzer'] = False
    
    def _auto_off_buzzer(self):
        """Auto turn off buzzer"""
        GPIO.output(self.BUZZER_PIN, GPIO.LOW)
        shared.actuator_status['buzzer'] = False
        print("Buzzer auto turned off")
    
    def check_alerts_and_control(self):
        """Check sensor values and control actuators based on thresholds"""
        # Temperature alerts
        if (shared.temperature > shared.thresholds['temperature_max'] or 
            shared.temperature < shared.thresholds['temperature_min']):
            if not shared.alert_status['temperature']:
                print(f"  Temperature alert: {shared.temperature}°C")
                self.control_led(self.RED_LED, 'red_led', True)
                shared.alert_status['temperature'] = True
                shared.local_error_message = "Temp Alert!"
                
                # Turn on fan if too hot
                if shared.temperature > shared.thresholds['temperature_max']:
                    self.control_motor(True)
        else:
            shared.alert_status['temperature'] = False
        
        # Humidity alerts
        if (shared.humidity > shared.thresholds['humidity_max'] or 
            shared.humidity < shared.thresholds['humidity_min']):
            if not shared.alert_status['humidity']:
                print(f"  Humidity alert: {shared.humidity}%")
                self.control_led(self.YELLOW_LED, 'yellow_led', True)
                shared.alert_status['humidity'] = True
                shared.local_error_message = "Humidity Alert!"
        else:
            shared.alert_status['humidity'] = False
        
        # Light alerts
        if shared.light_level < shared.thresholds['light_min']:
            if not shared.alert_status['light']:
                print(f" Low light alert: {shared.light_level}%")
                self.control_led(self.GREEN_LED, 'green_led', True)
                shared.alert_status['light'] = True
                shared.local_error_message = "Low Light!"
        else:
            shared.alert_status['light'] = False
        
        # Air quality alerts
        if shared.air_quality > shared.thresholds['air_quality_max']:
            if not shared.alert_status['air_quality']:
                print(f"  Air quality alert: {shared.air_quality}")
                self.control_led(self.BLUE_LED, 'blue_led', True)
                self.control_buzzer(True, 3.0)  # 3 second buzzer
                shared.alert_status['air_quality'] = True
                shared.local_error_message = "Bad Air Quality!"
        else:
            shared.alert_status['air_quality'] = False
        
        # Presence detection
        if shared.distance < shared.thresholds['presence_distance']:
            if not shared.alert_status['presence']:
                print(f" Presence detected: {shared.distance}cm")
                shared.alert_status['presence'] = True
        else:
            shared.alert_status['presence'] = False
    
    def cleanup(self):
        """Cleanup GPIO and cancel timers"""
        # Cancel all active timers
        for timer in self.auto_off_timers.values():
            if timer.is_alive():
                timer.cancel()
        
        # Turn off all actuators
        self.turn_off_all()
        print("Actuators cleaned up")