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

        # Definición de topics según requerimiento

        self.topics = {
            "temperature": f"GRUPO{group_6}/sensores/rasp03/temperatura",
            "humidity": f"GRUPO{group_6}/sensores/rasp03/humedad",
            "light": f"GRUPO{group_6}/sensores/rasp03/luz",
            "pressure": f"GRUPO{group_6}/sensores/rasp03/presion",
            "air_quality": f"GRUPO{group_6}/sensores/rasp03/calidad_aire",
            "distance": f"GRUPO{group_6}/sensores/rasp03/distancia",
            "alerts": f"GRUPO{group_6}/sensores/rasp03/alertas",
            "actuators_status": f"GRUPO{group_6}/sensores/rasp03/actuadores",
            "Envio_estadisticas": f"GRUPO{group_6}/sensores/rasp03/resultados_calculos",
            # Topics de control:
            "control_comandos": f"GRUPO{group_6}/sensores/rasp03/comandos",
            "control_modo": f"GRUPO{group_6}/sensores/rasp03/modo",
            "control_estadistica": f"GRUPO{group_6}/sensores/rasp03/estadistica",
            "control_LCD": f"GRUPO{group_6}/sensores/rasp03/pantalla",
            
        }

        self.client = mqtt.Client(client_id=self.client_id)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        self.connected = False
        self.last_publish_time = 0
        self.publish_interval = 1  # segundos

        logging.info(f"MQTT Client inicializado - Grupo: {group_6}")

    def _on_connect(self, client, userdata, flags, rc):

        if rc == 0:
            self.connected = True
            logging.info(
                f"Conectado a MQTT broker en {self.broker_host}:{self.broker_port}"
            )

            # Suscribirse a los dos topics de control

            client.subscribe(self.topics["control_comandos"])
            client.subscribe(self.topics["control_modo"])
            client.subscribe(self.topics["control_estadistica"]) 
            client.subscribe(self.topics["control_LCD"])
            logging.info(f"Suscrito a: {self.topics['control_LCD']}")
            logging.info(f"Suscrito a: {self.topics['control_comandos']}")
            logging.info(f"Suscrito a: {self.topics['control_modo']}")

        else:
            logging.error(f"Fallo en conexión a broker MQTT. Código de retorno: {rc}")

    def _on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logging.info(f"Mensaje recibido en {topic}: {payload}")
            if topic == self.topics["control_modo"]:
                # Espera {"modo": true/false}
                modo = payload.get("modo")
                if modo is not None:
                    shared.modo_control = bool(modo)
                    if bool(modo):
                        for item in shared.actuadores:
                            shared.actuadores[item] = True
                    shared.modo_automatico = bool(modo)
                    modo_txt = "AUTOMÁTICO" if modo else "MANUAL"
                    logging.info(f"Modo de control cambiado a: {modo_txt}")
                else:
                    shared.modo_control = True

            elif topic == self.topics["control_comandos"]:
                # Espera {"action": true/false, "actuador": "motor_fan"}
                actuador = payload.get("actuador")
                action = payload.get("action")
                if actuador and actuador in shared.actuadores and action is not None:
                    shared.actuadores[actuador] = bool(action)
                    estado_txt = "ENCENDIDO" if action else "APAGADO"
                    logging.info(f"Actuador '{actuador}' cambiado a: {estado_txt}")

            elif topic == self.topics["control_estadistica"]:
                sensor = payload.get("sensor")
                if sensor:
        
                    from analisis import AnalysisManager
                    analysis_manager = AnalysisManager()
                    
                    stats_success = analysis_manager.process_statistics_request(sensor)
                    
                    if stats_success:
                        logging.info(f"Cálculos completos para: {sensor}")
                    else:
                        logging.error(f"Error en cálculos para: {sensor}")
                else:
                    logging.warning("Comando de cálculo sin sensor especificado")

                    
            elif topic == self.topics["control_LCD"]:
                selected = payload.get("selected")
                if selected:
                    # Cambiar modo de display según selección
                    if selected == "sensores":
                        shared.lcd_mode = "sensores"
                        logging.info("LCD cambiado a modo: Sensores en tiempo real")
                    elif selected == "predicciones":
                        shared.lcd_mode = "predicciones"
                        logging.info("LCD cambiado a modo: Predicciones")
                    elif selected == "estadisticas":
                        shared.lcd_mode = "estadisticas"
                        logging.info("LCD cambiado a modo: Estadísticas")
                    else:
                        logging.warning(f"Modo LCD no reconocido: {selected}")
                else:
                    logging.warning("Comando LCD sin selección especificada")

            else:
                logging.warning(
                "Comando recibido sin actuador válido o acción no definida."
                )

        except Exception as e:
            logging.error(f"Error procesando mensaje MQTT: {e}")
    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        logging.warning(f"Desconectado del broker MQTT. Código de retorno: {rc}")
    def connect(self):
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            logging.info("Conexión MQTT iniciada")
        except Exception as e:
            logging.error(f"Error al conectar con el broker MQTT: {e}")
    def disconnect(self):
        if self.connected:
            self.client.loop_stop()
            self.client.disconnect()
            logging.info("Desconectado del broker MQTT")
    def publish_sensor_data(self):
  
        if not self.connected:
            return
        current_time = time.time()
        timestamp = int(current_time * 1000)
        try:
            sensor_data = {
                "temperature": {
                    "value": shared.temperature,
                    "min": shared.thresholds["temperature_min"],
                    "max": shared.thresholds["temperature_max"],
                    "status": "normal",
                    "unit": "°C",
                    "timestamp": timestamp,
                },
                "humidity": {
                    "value": shared.humidity,
                    "min": shared.thresholds["humidity_min"],
                    "max": shared.thresholds["humidity_max"],
                    "status": "normal",
                    "unit": "%",
                    "timestamp": timestamp,
                },
                "light": {
                    "value": shared.light_level,
                    "min": shared.thresholds["light_min"],
                    "max": shared.thresholds["light_max"],
                    "status": "normal",
                    "unit": "Lux",
                    "timestamp": timestamp,
                },
                "pressure": {
                    "value": shared.pressure,
                    "min": shared.thresholds["Presure_min"],
                    "max": shared.thresholds["Presure_max"],
                    "status": "normal",
                    "unit": "hPa",
                    "timestamp": timestamp,
                },
                "air_quality": {
                    "value": shared.air_quality,
                    "min": shared.thresholds["air_quality_min"],
                    "max": shared.thresholds["air_quality_max"],
                    "status": "normal",
                    "unit": "ppm",
                    "timestamp": timestamp,
                },
                "distance": {
                    "value": shared.distance,
                    "min": shared.thresholds["presence_distance_min"],
                    "max": shared.thresholds["presence_distance_max"],
                    "status": "normal",
                    "unit": "cm",
                    "timestamp": timestamp,
                },
            }

            # Publicar todos los sensores
            for sensor, data in sensor_data.items():
                topic = self.topics[sensor]
                payload = json.dumps(data)
                self.client.publish(topic, payload, retain=False)
            # Publicar alertas
            alerts_payload = json.dumps(
                {"alerts": shared.alert_status, "timestamp": timestamp}
            )
            self.client.publish(self.topics["alerts"], alerts_payload, retain=True)

            # Publicar estado de actuadores
            actuators_payload = json.dumps(
                {"actuators": shared.actuator_status, "timestamp": timestamp}
            )
            self.client.publish(
                self.topics["actuators_status"], actuators_payload, retain=True
            )


            #  Verificar si hay nuevos resultados de análisis para enviar
            if getattr(shared, 'new_analysis_results_ready', False):
                self.publish_analysis_results()
                shared.new_analysis_results_ready = False  # Reset flag
                logging.info("Resultados de análisis enviados automáticamente")
            # self.publish_analysis_results()
            # logging.info("Resultados de análisis enviados automáticamente")

            self.last_publish_time = current_time
            logging.debug("Datos de sensores publicados a MQTT")
        except Exception as e:
            logging.error(f"Error publicando datos de sensores: {e}")


    def publish_analysis_results(self):
        """
        Publica TODAS las variables globales de análisis (estadísticas + predicciones)
        """
        logging.info("🚀 INICIANDO publish_analysis_results()")
        
        if not self.connected:
            logging.error("❌ MQTT no conectado - abortando envío de resultados")
            return
        
        try:
            current_time = time.time()
            timestamp = int(current_time * 1000)
            
            # ========== DEBUG: VERIFICAR TOPIC ==========
            topic_name = self.topics["Envio_estadisticas"]
            logging.info(f"📍 Topic de destino: {topic_name}")
            
            # ========== DEBUG: LEER VARIABLES GLOBALES ==========
            logging.info("🔍 Leyendo variables globales...")
            
            media = getattr(shared, 'ultima_media', 0.0)
            mediana = getattr(shared, 'ultima_mediana', 0.0)
            moda = getattr(shared, 'ultima_moda', 0.0)
            minimo = getattr(shared, 'ultimo_minimo', 0.0)
            maximo = getattr(shared, 'ultimo_maximo', 0.0)
            desviacion = getattr(shared, 'ultima_desviacion', 0.0)
            varianza = getattr(shared, 'ultima_varianza', 0.0)
            movil = getattr(shared, 'ultima_media_movil', 0.0)
            suavizado = getattr(shared, 'ultimo_suavizado_exponencial', 0.0)
            
            logging.info(f"   📊 Estadísticas: media={media}, mediana={mediana}, moda={moda}")
            logging.info(f"   📊 Min/Max: min={minimo}, max={maximo}")
            logging.info(f"   📊 Desviación/Varianza: desv={desviacion}, var={varianza}")
            logging.info(f"   📈 Predicciones: movil={movil}, suavizado={suavizado}")
            
            # Crear payload con TODAS las variables globales
            analysis_payload = {
                # Estadísticas
                "media": media,
                "mediana": mediana,
                "moda": moda,
                "minimo": minimo,
                "maximo": maximo,
                "desviacion": desviacion,
                "varianza": varianza,
                
                # Predicciones
                "movil": movil,
                "suavizado": suavizado,
                
                # Metadata
                "timestamp": timestamp,
                "tipo": "resultados_completos"
            }
            
            # ========== DEBUG: VERIFICAR PAYLOAD ==========
            payload_json = json.dumps(analysis_payload)
            logging.info(f"📦 Payload creado (tamaño: {len(payload_json)} chars)")
            logging.info(f"📦 Payload completo: {payload_json}")
            
            # ========== INTENTAR PUBLICAR ==========
            logging.info(f"📤 Intentando publicar a topic: {topic_name}")
            
            try:
                # Usar QoS 1 para garantizar entrega
                message_info = self.client.publish(
                    topic_name, 
                    payload_json, 
                    qos=1,  # ← Cambiar a QoS 1 para garantizar entrega
                    retain=True
                )
                
                # Verificar si el mensaje fue aceptado
                if hasattr(message_info, 'rc'):
                    if message_info.rc == 0:
                        logging.info("✅ Mensaje aceptado por el cliente MQTT")
                    else:
                        logging.error(f"❌ Error en publish: código {message_info.rc}")
                
                # Verificar mid (message ID)
                if hasattr(message_info, 'mid'):
                    logging.info(f"📨 Message ID: {message_info.mid}")
                
            except Exception as publish_error:
                logging.error(f"❌ Error específico en client.publish(): {publish_error}")
                raise
            
            logging.info("✅ publish_analysis_results() completado exitosamente")
            
        except Exception as e:
            logging.error(f"❌ Error en publish_analysis_results(): {e}")
            import traceback
            logging.error(f"📍 Traceback completo: {traceback.format_exc()}")
            raise  # Re-lanzar para que se vea en los logs principales


    def publish_alert(self, alert_type, message, value):
        if not self.connected:
            return
        try:
            alert_payload = {
                "type": alert_type,
                "message": message,
                "value": value,
                "timestamp": int(time.time() * 1000),
                "severity": "critical",
            }
            self.client.publish(self.topics["alerts"], json.dumps(alert_payload))
            logging.info(f"Alerta publicada: {alert_type} - {message}")
        except Exception as e:
            logging.error(f"Error publicando alerta: {e}")
    def is_connected(self):

        return self.connected
