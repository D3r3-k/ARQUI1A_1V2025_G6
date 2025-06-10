from queue import LifoQueue   
class GlobalState:
    _instance = None  
                           
    
    def __new__(cls):                                       # Singleton pattern
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance
    
    def _init(self):                                        # Initialize shared variables
        # Sensor readings
        self.temperature = 0.0
        self.humidity = 0.0
        self.distance = 0.0
        self.light_level = 0
        self.pressure = 0.0
        self.air_quality = 0
        
        # System messages
        self.local_error_message = ""
        
        # Alert status tracking
        self.alert_status = {
            'temperature': False,
            'humidity': False,
            'light': False,
            'air_quality': False,
            'presence': False
        }
        
        # Actuator status
        self.actuator_status = {
            'red_led': False,      # Temperature alert
            'yellow_led': False,   # Humidity alert  
            'green_led': False,    # Light alert
            'blue_led': False,     # Air quality alert
            'motor_fan': False,    # Cooling fan
            'buzzer': False        # Audio alert
        }
        
        # Alert thresholds (configurable)
        self.thresholds = {
            'temperature_max': 30.0,    # °C
            'temperature_min': 15.0,    # °C
            'humidity_max': 80.0,       # %
            'humidity_min': 30.0,       # %
            'light_min': 20,            # % (too dark)
            'air_quality_max': 300,     # Air quality index
            'presence_distance': 50.0   # cm (presence detected)
        }
        self.remote_commands = {}
        self.pila_temperatura = LifoQueue() 

shared = GlobalState()  # Create a shared instance of GlobalState