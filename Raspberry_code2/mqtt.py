import json
import time
import logging
import paho.mqtt.client as mqtt
from globals import shared

class MQTTClient:
    """
    MQTT Client for SIEPA system
    Handles publishing sensor data and subscribing to control commands
    """
    
    def __init__(self, broker_host, broker_port, group_6):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.group_number = group_6
        self.client_id = f"siepa_rasp_{group_6}"
        
        # MQTT Topics según el formato requerido
        self.topics = {
            "temperature": f"GRUPO{group_6}/sensores/rasp02/temperatura",
            "humidity": f"GRUPO{group_6}/sensores/rasp02/humedad",
            "light": f"GRUPO{group_6}/sensores/rasp02/luz",
            "pressure": f"GRUPO{group_6}/sensores/rasp02/presion",
            "air_quality": f"GRUPO{group_6}/sensores/rasp02/calidad_aire",
            "distance": f"GRUPO{group_6}/sensores/rasp02/distancia",
            "alerts": f"GRUPO{group_6}/sensores/rasp02/alertas",
            "actuators_status": f"GRUPO{group_6}/sensores/rasp02/actuadores",
            

            # Topic para recibir comandos del dashboard
            "control": f"GRUPO{group_6}/control/rasp02/comandos"
        }
        
        # Initialize MQTT client
        self.client = mqtt.Client(client_id=self.client_id)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
        self.connected = False
        self.last_publish_time = 0
        self.publish_interval = 2  # Publish every 2 seconds
        
        logging.info(f"MQTT Client initialized - Group: {group_6}")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when MQTT client connects"""
        if rc == 0:
            self.connected = True
            logging.info(f"Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
            
            # Subscribe to control topic
            client.subscribe(self.topics["control"])
            logging.info(f"Subscribed to control topic: {self.topics['control']}")
        else:
            logging.error(f"Failed to connect to MQTT broker. Return code: {rc}")
    
    def _on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages (control commands from dashboard)"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logging.info(f"Received message on {topic}: {payload}")
            
            # Handle control commands
            if topic == self.topics["control"]:
                self._handle_control_command(payload)
                
        except Exception as e:
            logging.error(f"Error processing MQTT message: {e}")
    
    def _handle_control_command(self, command):
        try:
            cmd_type = command.get("type")
            device = command.get("actuador", "")
            action = command.get("action")
            logging.info(f"Recibido control: type={cmd_type}, device={device}, action={action}")

            if cmd_type == "manual_control":
                if device and device in shared.actuadores:
                    shared.actuadores[device] = bool(action)
                    logging.info(f"Manual: {device} cambiado a {action}")
                else:
                    logging.info("Manual control recibido, sin actuador específico (solo cambia modo_control)")
                shared.modo_control = False
                logging.info("Cambiando a modo manual")
                if device and device in shared.actuadores:
                    shared.actuadores[device] = bool(action)
                    logging.info(f"Manual: {device} -> {action}")
                else:
                    logging.info("Manual control recibido, sin actuador específico (solo cambia modo_control)")
            elif cmd_type == "auto_control":
                shared.modo_control = True
                logging.info("Cambiando a modo automático")

        except Exception as e:
            logging.error(f"Error handling control command: {e}")
                    
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when MQTT client disconnects"""
        self.connected = False
        logging.warning(f"Disconnected from MQTT broker. Return code: {rc}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()  # Start background thread for MQTT
            logging.info("MQTT connection initiated")
        except Exception as e:
            logging.error(f"Error connecting to MQTT broker: {e}")
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.connected:
            self.client.loop_stop()
            self.client.disconnect()
            logging.info("Disconnected from MQTT broker")
    
    def publish_sensor_data(self):
        """Publish all sensor data to MQTT topics"""
        if not self.connected:
            return

        current_time = time.time()
        timestamp = int(current_time * 1000)

        try:
            # Individual sensor data
            sensor_data = {
                "temperature": {
                    "value": shared.temperature,
                    "min": shared.thresholds["temperature_min"],
                    "max": shared.thresholds["temperature_max"],
                    "status": "normal",
                    "unit": "°C",
                    "timestamp": timestamp
                },
                "humidity": {
                    "value": shared.humidity,
                    "min": shared.thresholds["humidity_min"],
                    "max": shared.thresholds["humidity_max"],
                    "status": "normal",
                    "unit": "%",
                    "timestamp": timestamp
                },
                "light": {
                    "value": shared.light_level,
                    "min": shared.thresholds["light_min"],
                    "max": shared.thresholds["light_max"],
                    "status": "normal",
                    "unit": "Lux",
                    "timestamp": timestamp
                },

                "pressure": {
                    "value": shared.pressure,
                    "min": shared.thresholds["Presure_min"],
                    "max": shared.thresholds["Presure_max"],
                    "status": "normal",
                    "unit": "hPa",
                    "timestamp": timestamp
                },
                "air_quality": {
                    "value": shared.air_quality,
                    "min": shared.thresholds["air_quality_min"],
                    "max": shared.thresholds["air_quality_max"],
                    "status": "normal",
                    "unit": "ppm",
                    "timestamp": timestamp
                },
                "distance": {
                    "value": shared.distance,
                    "min": shared.thresholds["presence_distance_min"],
                    "max": shared.thresholds["presence_distance_max"],
                    "status": "normal",
                    "unit": "cm",
                    "timestamp": timestamp
                }
            }

            # Publish all sensor and historical data with retain=True
            for sensor, data in sensor_data.items():
                topic = self.topics[sensor]
                payload = json.dumps(data)
                self.client.publish(topic, payload, retain=False) 

            # Publish alerts
            alerts_payload = json.dumps({
                "alerts": shared.alert_status,
                "timestamp": timestamp
            })
            self.client.publish(self.topics["alerts"], alerts_payload, retain=True)

            # Publish actuators status
            actuators_payload = json.dumps({
                "actuators": shared.actuator_status,
                "timestamp": timestamp
            })
            self.client.publish(self.topics["actuators_status"], actuators_payload, retain=True)

            self.last_publish_time = current_time
            logging.debug("Published sensor data to MQTT")

        except Exception as e:
            logging.error(f"Error publishing sensor data: {e}")

    
    def publish_alert(self, alert_type, message, value):
        """Publish specific alert"""
        if not self.connected:
            return
        
        try:
            alert_payload = {
                "type": alert_type,
                "message": message,
                "value": value,
                "timestamp": int(time.time() * 1000),
                "severity": "critical"
            }
            
            self.client.publish(self.topics["alerts"], json.dumps(alert_payload))
            logging.info(f"Published alert: {alert_type} - {message}")
            
        except Exception as e:
            logging.error(f"Error publishing alert: {e}")
    
    def is_connected(self):
        """Check if client is connected"""
        return self.connected