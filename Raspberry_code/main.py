import time
import threading
import logging
import signal
import sys
from sensors import Sensors
from display import Display
from actuadores import Actuators
from mqtt import MQTTClient

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)

class SIEPA:

    def __init__(self, mqtt_broker="localhost", mqtt_port=1883, group_number="1"):
        self.running = True
        self.intervals = {
            "principal": 0.1,  # Main loop interval
            "mqtt": 2,         # MQTT publish interval
        }
        
        # Initialize components with error handling
        try:
            self.sensors = Sensors()
            self.display = Display()
            self.actuators = Actuators()
            
            # Initialize MQTT client
            self.mqtt_client = MQTTClient(
                broker_host=mqtt_broker,
                broker_port=mqtt_port,
                group_6=group_number
            )
            
            self.display.display_message("SIEPA Starting...")
            logging.info("SIEPA initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize SIEPA: {e}")
            raise

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logging.info(f"Received signal {signum}, shutting down gracefully...")
        self.running = False

    def run_tasks(self):
        """Main task execution with error handling"""
        try:
            # Read sensors
            self.sensors.read_sensors()
            self.sensors.print_data()
            
            # Check alerts and control actuators
            self.actuators.check_alerts_and_control()
            
            # Update display
            self.display.update()
            
        except Exception as e:
            logging.error(f"Error in run_tasks: {e}")

    def mqtt_tasks(self):
        """MQTT publishing tasks"""
        while self.running:
            try:
                if self.mqtt_client.is_connected():
                    # Publish sensor data
                    self.mqtt_client.publish_sensor_data()
                else:
                    # Try to reconnect if disconnected
                    logging.warning("MQTT client disconnected, attempting to reconnect...")
                    self.mqtt_client.connect()
                    
            except Exception as e:
                logging.error(f"MQTT error: {e}")
            
            time.sleep(self.intervals["mqtt"])

    def health_check(self):
        """System health monitoring"""
        last_health_log = time.time()
        
        while self.running:
            try:
                # Log health status every 5 minutes
                if time.time() - last_health_log > 300:
                    mqtt_status = "Connected" if self.mqtt_client.is_connected() else "Disconnected"
                    logging.info(f"SIEPA health check: System running normally, MQTT: {mqtt_status}")
                    last_health_log = time.time()
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logging.error(f"Health check error: {e}")

    def start_mqtt_connection(self):
        """Initialize MQTT connection"""
        try:
            self.mqtt_client.connect()
            logging.info("MQTT connection started")
        except Exception as e:
            logging.error(f"Failed to start MQTT connection: {e}")

    def main_loop(self):
        """Main application loop"""
        mqtt_thread = None
        health_thread = None
        
        try:
            # Start MQTT connection
            self.start_mqtt_connection()
            
            # Start background threads
            mqtt_thread = threading.Thread(target=self.mqtt_tasks, daemon=True)
            health_thread = threading.Thread(target=self.health_check, daemon=True)
            
            mqtt_thread.start()
            health_thread.start()
            
            logging.info("SIEPA main loop started")
            
            # Main loop
            while self.running:
                self.run_tasks()
                time.sleep(self.intervals["principal"])
                
        except Exception as e:
            logging.error(f"Critical error in main loop: {e}")
            self.running = False
            
        finally:
            self._cleanup()

    def _cleanup(self):
        """Cleanup resources"""
        logging.info("Cleaning up resources...")
        try:
            # Disconnect MQTT
            if hasattr(self, 'mqtt_client'):
                self.mqtt_client.disconnect()
            
            # Cleanup hardware components
            if hasattr(self, 'sensors'):
                self.sensors.cleanup()
            if hasattr(self, 'actuators'):
                self.actuators.cleanup()
            if hasattr(self, 'display'):
                self.display.display_message("SIEPA Stopped")
                
        except Exception as e:
            logging.error(f"Error during cleanup: {e}")

if __name__ == "__main__":
    # Configuration
    MQTT_BROKER = "localhost"  # Cambiar por la IP del broker
    MQTT_PORT = 1883
    GROUP_NUMBER = "1"  # Cambiar por tu número de grupo
    
    try:
        logging.info("Starting SIEPA application...")
        siepa = SIEPA(
            mqtt_broker=MQTT_BROKER,
            mqtt_port=MQTT_PORT,
            group_number=GROUP_NUMBER
        )
        siepa.main_loop()
        
    except KeyboardInterrupt:
        logging.info("Application interrupted by user")
    except Exception as e:
        logging.error(f"Fatal error: {e}")
        sys.exit(1)
    finally:
        logging.info("SIEPA application terminated")
        sys.exit(0)