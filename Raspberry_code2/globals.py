import time
class GlobalState:
    _instance = None  
                             
    
    def __new__(cls):                                       # Singleton pattern
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance
    
    def _init(self):    
        current_time = time.time()                           # Initialize shared variables
        # Sensor readings
        self.temperature = 0.0
        self.humidity = 0.0
        self.distance = 0.0
        self.light_level = 0
        self.pressure = 0.0
        self.air_quality = 0
        
        self.modo_control = True
 
        self.actuadores= {
            'red_led': True,      # Temperature alert
            'yellow_led': True,   # Humidity alert  
            'green_led': True,    # Light alert
            'blue_led': True,     # Air quality alert
            'motor_fan': True,    # Cooling fan
            'buzzer': True        # Audio alert          
        }

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
            'temperature_max':  25,    # °C
            'temperature_min': 15.0,    # °C
            'humidity_max': 90.0,       # %
            'humidity_min': 30.0,       # %
            'light_min': 1,            # % (too dark)
            'light_max': 10,            # % (too lifht)
            'air_quality_max':160,     # Air quality index
            'air_quality_min': 135,     # Air quality index
            'presence_distance_min': 2.0,  # cm (presence detected)
            'presence_distance_max': 100,  # cm (presence detected)
            'Presure_min': 850,         # Presion hpa
            'Presure_max': 870         # Presion en hpa
        }

shared = GlobalState()  # Create a shared instance of GlobalState