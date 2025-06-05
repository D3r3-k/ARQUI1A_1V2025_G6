import board
import adafruit_dht
import RPi.GPIO as GPIO
from globals import shared

class Sensors:
    """
    Sensors class for interfacing with environmental sensors such as DHT11.
    Attributes:
        dht: Instance of the DHT11 sensor connected to a specified GPIO pin.
    Methods:
        __init__():
            Initializes the Sensors class and sets up the DHT11 sensor.
        read_sensors():
            Reads temperature and humidity values from the DHT11 sensor and updates
            the shared module's temperature and humidity attributes if valid readings are available.
        print_data():
            Prints the current temperature and humidity values stored in the shared module.
    """


    def __init__(self):
        # Setup GPIO mode
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

################################# INICIALIZACION DE PINES ################################# 

        # Sensor MQ135 (calidad del aire)
        self.MQ135_PIN = 17
        GPIO.setup(self.MQ135_PIN, GPIO.IN)

        # DHT11 sensor
        self.dht = adafruit_dht.DHT11(board.D27)
        
        # HC-SR04 Ultrasonic sensor pins
        self.TRIG_PIN = 23
        self.ECHO_PIN = 24
        GPIO.setup(self.TRIG_PIN, GPIO.OUT)
        GPIO.setup(self.ECHO_PIN, GPIO.IN)
        
        # LDR (Light sensor) - using voltage divider and ADC
        # Note: Pi doesn't have built-in ADC, using digital approximation
        self.LDR_PIN = 18
        GPIO.setup(self.LDR_PIN, GPIO.IN)
        
        # Initialize sensor readings to default values
        shared.temperature = 0.0
        shared.humidity = 0.0
        shared.distance = 0.0
        shared.light_level = 0
        shared.pressure = 0.0
        shared.air_quality = 0
        
        print("Sensores Inicializados con exito")
    
################################# FUNCIONES PARA CADA SENSOR ################################# 

    def read_dht11(self):
        """Read temperature and humidity from DHT11"""
        try:
            if self.dht.temperature is not None:
                shared.temperature = float(self.dht.temperature)
            if self.dht.humidity is not None:
                shared.humidity = float(self.dht.humidity)
        except Exception as e:
            print(f"DHT11 read error: {e}")
    
    def read_ultrasonic(self):
        """Read distance from HC-SR04 ultrasonic sensor"""
        try:
            # Send trigger pulse
            GPIO.output(self.TRIG_PIN, GPIO.HIGH)
            time.sleep(0.00001)  # 10 microseconds
            GPIO.output(self.TRIG_PIN, GPIO.LOW)
            
            # Wait for echo
            timeout = time.time() + 0.5  # 500ms timeout
            while GPIO.input(self.ECHO_PIN) == GPIO.LOW and time.time() < timeout:
                pulse_start = time.time()
            
            while GPIO.input(self.ECHO_PIN) == GPIO.HIGH and time.time() < timeout:
                pulse_end = time.time()
            
            # Calculate distance
            if 'pulse_start' in locals() and 'pulse_end' in locals():
                pulse_duration = pulse_end - pulse_start
                distance = pulse_duration * 17150  # Speed of sound / 2
                distance = round(distance, 2)
                
                if 2 <= distance <= 400:  # Valid range for HC-SR04
                    shared.distance = distance
            
        except Exception as e:
            print(f"Ultrasonic read error: {e}")
    
    def read_light_sensor(self):
        """Read light level using LDR"""
        try:
            # Simple digital read (for demonstration)
            # In real implementation, you'd use an ADC like MCP3008
            light_value = GPIO.input(self.LDR_PIN)
            shared.light_level = light_value * 100  # Convert to percentage
            
        except Exception as e:
            print(f"Light sensor read error: {e}")
    
    def read_pressure_sensor(self):
        """Read pressure from BMP280 (placeholder - requires I2C setup)"""
        try:
            # TODO: Implement BMP280 reading via I2C
            # For now, simulate reading
            import random
            shared.pressure = round(random.uniform(1000, 1020), 2)
            
        except Exception as e:
            print(f"Pressure sensor read error: {e}")
    
    def read_air_quality(self): 
        """Read MQ135 digital signal"""
        try:
            value = GPIO.input(self.MQ135_PIN)
            # 0 = buena calidad, 1 = mala calidad
            shared.air_quality = 400 if value == 1 else 100
        except Exception as e:
            print(f"MQ135 read error: {e}")

    
    def read_sensors(self):
        """Read all sensors"""
        self.read_dht11()
        self.read_ultrasonic()
        self.read_light_sensor()
        self.read_pressure_sensor()
        self.read_air_quality()
    
    def print_data(self):
        """Print all sensor data"""
        print(f"Temp: {shared.temperature:.1f}°C | "
              f"Humidity: {shared.humidity:.1f}% | "
              f"Distance: {shared.distance:.1f}cm | "
              f"Light: {shared.light_level}% | "
              f"Pressure: {shared.pressure:.1f}hPa | "
              f"Air Quality: {shared.air_quality}")
    
    def cleanup(self):
        """Cleanup GPIO resources"""
        GPIO.cleanup()