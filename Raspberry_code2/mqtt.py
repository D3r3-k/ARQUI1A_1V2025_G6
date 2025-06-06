import json
import time
import logging
import paho.mqtt.client as mqtt
from globals import shared

class MQTTClient:
    """
    MQTT Client for SIEPA system
    Sends all sensor data as a single JSON message to one MQTT topic
    """

    def __init__(self, broker_host="broker.hivemq.com", broker_port=1883, group_6="G1"):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.group_number = group_6
        self.client_id = f"siepa_rasp_{group_6}"

        # Topic único para todo el JSON combinado
        self.topic = f"GRUPO{group_6}/sensores/rasp01/temperatura"

        # Inicializar cliente MQTT
        self.client = mqtt.Client(client_id=self.client_id)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect

        self.connected = False
        self.last_publish_time = 0
        self.publish_interval = 2  # Publicar cada 2 segundos

        logging.info(f"MQTT Client initialized - Group: {group_6}")

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.connected = True
            logging.info(f"Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
        else:
            logging.error(f"Failed to connect to MQTT broker. Return code: {rc}")

    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        logging.warning(f"Disconnected from MQTT broker. Return code: {rc}")

    def connect(self):
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            logging.info("MQTT connection initiated")
        except Exception as e:
            logging.error(f"Error connecting to MQTT broker: {e}")

    def disconnect(self):
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
            timestamp = int(current_time * 1000)

            payload = {
                "temperatura": shared.temperature,
                "humedad": shared.humidity,
                "luz": shared.light_level,
                "presion": shared.pressure,
                "calidad_aire": shared.air_quality,
                "distancia": shared.distance,
                "timestamp": timestamp
            }

            self.client.publish(self.topic, json.dumps(payload))
            logging.info(f"Published sensor data: {payload}")

            self.last_publish_time = current_time

        except Exception as e:
            logging.error(f"Error publishing sensor data: {e}")

    def is_connected(self):
        return self.connected
