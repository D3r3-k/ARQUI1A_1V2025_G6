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
    handlers=[logging.StreamHandler(sys.stdout)],
)

class SIEPA:

    def __init__(self, mqtt_broker='broker.emqx.io', mqtt_port=1883, group_number="G6"):
        self.running = True
        self.intervals = {
            "principal": 2.0,  # ← ahora cada 2 segundos imprimimos los datos
            "mqtt": 5,
        }

        try:
            self.sensors = Sensors()
            self.display = Display()
            self.actuators = Actuators()

            self.mqtt_client = MQTTClient(
                broker_host=mqtt_broker,
                broker_port=mqtt_port,
                group_6=group_number
            )

            self.display.display_message("Iniciando SIEPA")
            logging.info("SIEPA initialized successfully")

        except Exception as e:
            logging.error(f"Failed to initialize SIEPA: {e}")
            raise

        # Señales de cierre con Ctrl+C
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        logging.info(f"\nReceived signal {signum}, Programa cerrado Correctamente...")
        self.running = False
        self._cleanup()
        print()  # Salto de línea para regresar bien al prompt
        sys.exit(0)

    def run_tasks(self):
        try:
            self.sensors.read_sensors()
            self.sensors.print_data() 
            self.actuators.check_alerts_and_control()
            self.display.update()
        except Exception as e:
            logging.error(f"Error in run_tasks: {e}")

    def mqtt_tasks(self):
        while self.running:
            try:
                if self.mqtt_client.is_connected():
                    self.mqtt_client.publish_sensor_data()
                else:
                    logging.warning("MQTT client disconnected, attempting to reconnect...")
                    self.mqtt_client.connect()
            except Exception as e:
                logging.error(f"MQTT error: {e}")
            time.sleep(self.intervals["mqtt"])

    def health_check(self):
        last_health_log = time.time()
        while self.running:
            try:
                if time.time() - last_health_log > 300:
                    mqtt_status = "Connected" if self.mqtt_client.is_connected() else "Disconnected"
                    logging.info(f"SIEPA health check: System running normally, MQTT: {mqtt_status}")
                    last_health_log = time.time()
                time.sleep(30)
            except Exception as e:
                logging.error(f"Health check error: {e}")

    def start_mqtt_connection(self):
        try:
            self.mqtt_client.connect()
            logging.info("MQTT connection started")
        except Exception as e:
            logging.error(f"Failed to start MQTT connection: {e}")

    def main_loop(self):
        mqtt_thread = threading.Thread(target=self.mqtt_tasks, daemon=True)
        health_thread = threading.Thread(target=self.health_check, daemon=True)

        try:
            self.start_mqtt_connection()
            mqtt_thread.start()
            health_thread.start()
            logging.info("SIEPA main loop started")

            while self.running:
                self.run_tasks()
                time.sleep(self.intervals["principal"])

        except Exception as e:
            logging.error(f"Critical error in main loop: {e}")
            self.running = False
        finally:
            self._cleanup()

    def _cleanup(self):
        logging.info("Cleaning up resources...")
        try:
            if hasattr(self, 'mqtt_client'):
                self.mqtt_client.disconnect()
            if hasattr(self, 'sensors'):
                self.sensors.cleanup()
            if hasattr(self, 'actuators'):
                self.actuators.cleanup()
            if hasattr(self, 'display'):
                self.display.display_message("SIEPA Stopped")
        except Exception as e:
            logging.error(f"Error during cleanup: {e}")

if __name__ == "__main__":
    MQTT_BROKER = "broker.emqx.io"  
    MQTT_PORT = 1883
    GROUP_NUMBER = "G6"  

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
        print()
    except Exception as e:
        logging.error(f"Fatal error: {e}")
        sys.exit(1)
    finally:
        logging.info("SIEPA application terminated")
        print()  # ← salto final
        sys.exit(0)
