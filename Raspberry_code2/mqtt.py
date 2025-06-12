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
            "temperature": f"GRUPO{group_6}/sensores/rasp01/temperatura",
            "humidity": f"GRUPO{group_6}/sensores/rasp01/humedad",
            "light": f"GRUPO{group_6}/sensores/rasp01/luz",
            "pressure": f"GRUPO{group_6}/sensores/rasp01/presion",
            "air_quality": f"GRUPO{group_6}/sensores/rasp01/calidad_aire",
            "distance": f"GRUPO{group_6}/sensores/rasp01/distancia",
            "alerts": f"GRUPO{group_6}/sensores/rasp01/alertas",
            "actuators_status": f"GRUPO{group_6}/sensores/rasp01/actuadores",
            
            # Historicos
            "Historico_Temperatura": f"GRUPO{group_6}/sensores/rasp01/HTemperatura",
            "Historico_Humedad": f"GRUPO{group_6}/sensores/rasp01/HHumedad",
            "Historico_Presion": f"GRUPO{group_6}/sensores/rasp01/HPresion",
            "Historico_Luz": f"GRUPO{group_6}/sensores/rasp01/HLuz",

            # Topic para recibir comandos del dashboard
            "control": f"GRUPO{group_6}/control/rasp01/comandos"
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
        """Process control commands from dashboard"""
        try:
            cmd_type = command.get("type")
            device = command.get("device")
            action = command.get("action")  # "on" or "off"
            
            if cmd_type == "actuator_control":
                # Update shared status for actuator control
                # This will be picked up by the actuators class
                if device in shared.actuator_status:
                    shared.remote_commands[device] = action
                    logging.info(f"Remote command: {device} -> {action}")
                    
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

        print("[MQTT] Publicando histórico HHumedad con tamaño:", len(shared.HHumedad["history"]))
        if shared.HHumedad["history"]:
            print("[MQTT] Último dato HHumedad:", json.dumps(shared.HHumedad["history"][-1]))

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
                    "min": shared.thresholds["humidity_min"],
                    "max": shared.thresholds["humidity_max"],
                    "status": "normal",
                    "unit": "%",
                    "timestamp": timestamp
                },
                "pressure": {
                    "value": shared.pressure,
                    "min": shared.thresholds["light_min"],
                    "max": 20,
                    "status": "normal",
                    "unit": "hPa",
                    "timestamp": timestamp
                },
                "air_quality": {
                    "value": shared.air_quality,
                    "min": 20,
                    "max": shared.thresholds["air_quality_max"],
                    "status": "normal",
                    "unit": "ppm",
                    "timestamp": timestamp
                },
                "distance": {
                    "value": shared.distance,
                    "min": 0,
                    "max": shared.thresholds["presence_distance"],
                    "status": "normal",
                    "unit": "cm",
                    "timestamp": timestamp
                },
                "Historico_Temperatura": {
                    "history": shared.HTemperatura["history"],
                    "timestamp": shared.HTemperatur["timestap"],
                    
                },
                "Historico_Humedad": {
                    "history": shared.HHumedad["history"],
                    "timestamp": shared.HHumedad["timestap"],
                    
                },
                "Historico_Presion": {
                    "history": shared.HPresion["history"],
                    "timestamp": shared.HPresion["timestap"],
                    
                },
                "Historico_Luz": {
                    "history": shared.HLuz["history"],
                    "timestamp": shared.HLuz["history"],
                    
                },
            }

            # Publish all sensor and historical data with retain=True
            for sensor, data in sensor_data.items():
                topic = self.topics[sensor]
                payload = json.dumps(data)
                self.client.publish(topic, payload, retain=True)  # <--- retain=True aquí

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