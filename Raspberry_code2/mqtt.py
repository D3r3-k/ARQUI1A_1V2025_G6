import json
import time
import logging
import paho.mqtt.client as mqtt
from globals import shared

class MQTTClient:

    
    def __init__(self, broker_host, broker_port, group_6):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.group_number = group_6
        self.client_id = f"siepa_rasp_{group_6}"
        

        self.topics = {
            "salida": f"GRUPO{group_6}/sensores/rasp01/salida",
            # Topic para recibir comandos del dashboard
            "control": f"GRUPO{group_6}/control/rasp01/comandos"
        }
        
        # Initialize MQTT client
        self.client = mqtt.Client(client_id=self.client_id)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
        # variables de verificacion
        self.connected = False
        self.last_publish_time = 0
        self.publish_interval = 2  # Publish every 2 seconds
        
        logging.info(f"MQTT Client initialized - Group: {group_6}")

    ## cunado el raspberry se conecta : 
    def _on_connect(self, client, userdata, flags, rc):

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

        if not self.connected:
            return

        current_time = time.time()
        if current_time - self.last_publish_time < self.publish_interval:
            return

        try:
            timestamp = int(current_time * 1000)  # Timestamp en milisegundos

            
            payload = {
                "temperatura": shared.temperature,
                "humedad": shared.humidity,
                "luz": shared.light_level,
                "presion": shared.pressure,
                "calidad_aire": shared.air_quality,
                "distancia": shared.distance,
                "timestamp": timestamp
            }

            
            topic = self.topics["salida"]  
            self.client.publish(topic, json.dumps(payload))
            logging.info(f"Published combined sensor data to {topic}")

            self.last_publish_time = current_time

        except Exception as e:
            logging.error(f"Error publishing combined sensor data: {e}")

    
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