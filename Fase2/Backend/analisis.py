import os
import subprocess
import logging
import tempfile
import json
from datetime import datetime
from globals import shared
import mongodb

class AnalysisManager:
    
    def __init__(self):
        # Configuración de paths y archivos
        self.temp_dir = "/tmp/siepa_analysis"
        self.arm64_stats_executable = "./arm64_stats"  # Path a tu ejecutable ARM64 de estadísticas
        self.arm64_pred_executable = "./arm64_predictions"  # Path a tu ejecutable ARM64 de predicciones
        
        # Crear directorio temporal si no existe
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # Mapeo de nombres de sensores para consistencia
        self.sensor_mapping = {
            "temperatura": "temperature",
            "temperature": "temperature",
            "humedad": "humidity", 
            "humidity": "humidity",
            "luz": "light",
            "light": "light",
            "presion": "pressure",
            "pressure": "pressure",
            "calidad_aire": "air_quality",
            "air_quality": "air_quality",
            "distancia": "distance",
            "distance": "distance"
        }
        
        logging.info("AnalysisManager inicializado correctamente")

    def process_statistics_request(self, sensor_name):
        try:
            # Normalizar nombre del sensor
            normalized_sensor = self.sensor_mapping.get(sensor_name.lower())
            if not normalized_sensor:
                logging.error(f"Sensor no reconocido: {sensor_name}")
                return False

            logging.info(f"Iniciando cálculo estadístico para sensor: {normalized_sensor}")
            
            # 1. Consultar datos de MongoDB
            data = self._get_sensor_data(normalized_sensor, 30)
            if not data:
                logging.warning(f"No se encontraron datos para el sensor: {normalized_sensor}")
                return False

            # 2. Crear archivo temporal con datos
            input_file = self._create_data_file(data, f"stats_input_{normalized_sensor}")
            if not input_file:
                return False

            # 3. Ejecutar código ARM64 para estadísticas
            output_file = f"{self.temp_dir}/stats_output_{normalized_sensor}.txt"
            success = self._execute_arm64_stats(input_file, output_file)
            
            if success:
                # 4. Procesar resultados
                results = self._parse_statistics_results(output_file, normalized_sensor)
                if results:
                    # 5. Guardar resultados en MongoDB
                    self._save_statistics_to_mongo(results, normalized_sensor)
                    # 6. Actualizar estado global
                    self._update_shared_statistics(results, normalized_sensor)
                    logging.info(f"Estadísticas calculadas exitosamente para {normalized_sensor}")
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Error procesando estadísticas para {sensor_name}: {e}")
            return False
        finally:
            # Limpieza de archivos temporales
            self._cleanup_temp_files([input_file, output_file])

    def process_prediction_request(self, sensor_name):
        """
        Procesa una solicitud de cálculo de predicciones para un sensor específico
        """
        try:
            # Normalizar nombre del sensor
            normalized_sensor = self.sensor_mapping.get(sensor_name.lower())
            if not normalized_sensor:
                logging.error(f"Sensor no reconocido: {sensor_name}")
                return False

            logging.info(f"Iniciando cálculo de predicciones para sensor: {normalized_sensor}")
            
            # 1. Consultar datos de MongoDB
            data = self._get_sensor_data(normalized_sensor, 30)
            if not data:
                logging.warning(f"No se encontraron datos para el sensor: {normalized_sensor}")
                return False

            # 2. Crear archivo temporal con datos
            input_file = self._create_data_file(data, f"pred_input_{normalized_sensor}")
            if not input_file:
                return False

            # 3. Ejecutar código ARM64 para predicciones
            output_file = f"{self.temp_dir}/pred_output_{normalized_sensor}.txt"
            success = self._execute_arm64_predictions(input_file, output_file)
            
            if success:
                # 4. Procesar resultados
                results = self._parse_prediction_results(output_file, normalized_sensor)
                if results:
                    # 5. Guardar resultados en MongoDB
                    self._save_predictions_to_mongo(results, normalized_sensor)
                    # 6. Actualizar estado global
                    self._update_shared_predictions(results, normalized_sensor)
                    logging.info(f"Predicciones calculadas exitosamente para {normalized_sensor}")
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Error procesando predicciones para {sensor_name}: {e}")
            return False
        finally:
            # Limpieza de archivos temporales
            self._cleanup_temp_files([input_file, output_file])

    def _get_sensor_data(self, sensor_name, count=30):
        """
        Obtiene los últimos N datos de un sensor desde MongoDB
        """
        try:
            # Mapear nombre del sensor a campo en MongoDB
            sensor_field_map = {
                "temperature": "temperatura",
                "humidity": "humedad",
                "light": "iluminacion",
                "pressure": "presion", 
                "air_quality": "calidad_aire",
                "distance": "distancia"
            }
            
            field_name = sensor_field_map.get(sensor_name)
            if not field_name:
                logging.error(f"Campo no encontrado para sensor: {sensor_name}")
                return None

            # Consultar MongoDB
            readings = mongodb.consultar_lecturas(count)
            
            if not readings:
                return None

            # Extraer solo los valores del sensor específico
            sensor_values = []
            for reading in readings:
                if field_name in reading and reading[field_name] is not None:
                    sensor_values.append(float(reading[field_name]))
            
            # Invertir para tener orden cronológico (más antiguo primero)
            sensor_values.reverse()
            
            logging.info(f"Obtenidos {len(sensor_values)} valores para {sensor_name}")
            return sensor_values
            
        except Exception as e:
            logging.error(f"Error obteniendo datos del sensor {sensor_name}: {e}")
            return None

    def _create_data_file(self, data, filename_prefix):
        """
        Crea un archivo temporal con los datos en formato esperado por ARM64
        Formato: cada número en una línea, terminado con $
        """
        try:
            filepath = f"{self.temp_dir}/{filename_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            
            with open(filepath, 'w') as f:
                for value in data:
                    f.write(f"{value}\n")
                f.write("$\n")  # Finalizador del archivo
            
            logging.debug(f"Archivo de datos creado: {filepath}")
            return filepath
            
        except Exception as e:
            logging.error(f"Error creando archivo de datos: {e}")
            return None

    def _execute_arm64_stats(self, input_file, output_file):
        """
        Ejecuta el código ARM64 para cálculos estadísticos
        """
        try:
            # Comando para ejecutar ARM64 (ajustar según tu implementación)
            cmd = [self.arm64_stats_executable, input_file, output_file]
            
            # Ejecutar proceso
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=30  # 30 segundos timeout
            )
            
            if result.returncode == 0:
                logging.debug("Ejecutable ARM64 de estadísticas completado exitosamente")
                return True
            else:
                logging.error(f"Error en ejecutable ARM64 de estadísticas: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logging.error("Timeout ejecutando código ARM64 de estadísticas")
            return False
        except Exception as e:
            logging.error(f"Error ejecutando ARM64 de estadísticas: {e}")
            return False

    def _execute_arm64_predictions(self, input_file, output_file):
        """
        Ejecuta el código ARM64 para predicciones
        """
        try:
            # Comando para ejecutar ARM64 (ajustar según tu implementación)
            cmd = [self.arm64_pred_executable, input_file, output_file]
            
            # Ejecutar proceso
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=30  # 30 segundos timeout
            )
            
            if result.returncode == 0:
                logging.debug("Ejecutable ARM64 de predicciones completado exitosamente")
                return True
            else:
                logging.error(f"Error en ejecutable ARM64 de predicciones: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logging.error("Timeout ejecutando código ARM64 de predicciones")
            return False
        except Exception as e:
            logging.error(f"Error ejecutando ARM64 de predicciones: {e}")
            return False

    def _parse_statistics_results(self, output_file, sensor_name):
        """
        Parsea los resultados estadísticos del archivo de salida ARM64
        """
        try:
            if not os.path.exists(output_file):
                logging.error(f"Archivo de resultados no encontrado: {output_file}")
                return None

            results = {}
            
            with open(output_file, 'r') as f:
                content = f.read().strip()
                
            # Parsear resultados (ajustar según formato de tu ARM64)
            # Ejemplo de formato esperado:
            # Media: 23.45
            # Mediana: 23.00
            # Moda: 22.00
            # Minimo: 18.50
            # Maximo: 28.30
            # Desviacion: 2.15
            # Varianza: 4.62
            
            lines = content.split('\n')
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    try:
                        value = float(value.strip())
                        results[key] = value
                    except ValueError:
                        results[key] = value.strip()
            
            logging.debug(f"Resultados estadísticos parseados: {results}")
            return results
            
        except Exception as e:
            logging.error(f"Error parseando resultados estadísticos: {e}")
            return None

    def _parse_prediction_results(self, output_file, sensor_name):
        """
        Parsea los resultados de predicción del archivo de salida ARM64
        """
        try:
            if not os.path.exists(output_file):
                logging.error(f"Archivo de resultados no encontrado: {output_file}")
                return None

            results = {}
            
            with open(output_file, 'r') as f:
                content = f.read().strip()
                
            # Parsear resultados (ajustar según formato de tu ARM64)
            # Ejemplo de formato esperado:
            # Media_Movil: 23.45
            # Suavizado_Exponencial: 23.67
            
            lines = content.split('\n')
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    try:
                        value = float(value.strip())
                        results[key] = value
                    except ValueError:
                        results[key] = value.strip()
            
            logging.debug(f"Resultados de predicción parseados: {results}")
            return results
            
        except Exception as e:
            logging.error(f"Error parseando resultados de predicción: {e}")
            return None

    def _save_statistics_to_mongo(self, results, sensor_name):
        """
        Guarda los resultados estadísticos en MongoDB
        """
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Usar la función existente de mongodb.py
            mongodb.insertar_estadisticas(
                sensor_de=sensor_name,
                hora_fecha=timestamp,
                media=results.get('media', 0),
                mediana=results.get('mediana', 0),
                moda=results.get('moda', 0),
                MinMax=f"{results.get('minimo', 0)} / {results.get('maximo', 0)}",
                desviacion=results.get('desviacion', 0),
                varianza=results.get('varianza', 0)
            )
            
            logging.info(f"Estadísticas guardadas en MongoDB para {sensor_name}")
            
        except Exception as e:
            logging.error(f"Error guardando estadísticas en MongoDB: {e}")

    def _save_predictions_to_mongo(self, results, sensor_name):
        """
        Guarda los resultados de predicción en MongoDB
        """
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Usar la función existente de mongodb.py
            mongodb.insertar_prediccion(
                sensor_de=sensor_name,
                hora_fecha=timestamp,
                mediaMovil=results.get('media_movil', 0),
                suavizado=results.get('suavizado_exponencial', 0)
            )
            
            logging.info(f"Predicciones guardadas en MongoDB para {sensor_name}")
            
        except Exception as e:
            logging.error(f"Error guardando predicciones en MongoDB: {e}")

    def _update_shared_statistics(self, results, sensor_name):
        """
        Actualiza el estado global con los resultados estadísticos
        """
        try:
            # Agregar resultados al estado global para mostrar en LCD/Dashboard
            if not hasattr(shared, 'latest_statistics'):
                shared.latest_statistics = {}
            
            shared.latest_statistics[sensor_name] = {
                'timestamp': datetime.now(),
                'results': results
            }
            
            # Flag para indicar que hay nuevos resultados estadísticos
            shared.new_statistics_available = True
            
            # Mensaje para LCD
            shared.local_error_message = f"Stats {sensor_name} OK"
            
        except Exception as e:
            logging.error(f"Error actualizando estado global con estadísticas: {e}")

    def _update_shared_predictions(self, results, sensor_name):
        """
        Actualiza el estado global con los resultados de predicción
        """
        try:
            # Agregar resultados al estado global para mostrar en LCD/Dashboard
            if not hasattr(shared, 'latest_predictions'):
                shared.latest_predictions = {}
            
            shared.latest_predictions[sensor_name] = {
                'timestamp': datetime.now(),
                'results': results
            }
            
            # Flag para indicar que hay nuevas predicciones
            shared.new_predictions_available = True
            
            # Mensaje para LCD
            shared.local_error_message = f"Pred {sensor_name} OK"
            
        except Exception as e:
            logging.error(f"Error actualizando estado global con predicciones: {e}")

    def _cleanup_temp_files(self, file_list):
        """
        Limpia archivos temporales
        """
        for filepath in file_list:
            try:
                if filepath and os.path.exists(filepath):
                    os.remove(filepath)
                    logging.debug(f"Archivo temporal eliminado: {filepath}")
            except Exception as e:
                logging.warning(f"No se pudo eliminar archivo temporal {filepath}: {e}")

    def get_latest_statistics(self, sensor_name=None):
        """
        Obtiene las últimas estadísticas calculadas
        """
        if not hasattr(shared, 'latest_statistics'):
            return None
            
        if sensor_name:
            return shared.latest_statistics.get(sensor_name)
        else:
            return shared.latest_statistics

    def get_latest_predictions(self, sensor_name=None):
        """
        Obtiene las últimas predicciones calculadas
        """
        if not hasattr(shared, 'latest_predictions'):
            return None
            
        if sensor_name:
            return shared.latest_predictions.get(sensor_name)
        else:
            return shared.latest_predictions

    def cleanup(self):
        """
        Limpieza general del módulo
        """
        try:
            # Limpiar directorio temporal
            if os.path.exists(self.temp_dir):
                for file in os.listdir(self.temp_dir):
                    filepath = os.path.join(self.temp_dir, file)
                    if os.path.isfile(filepath):
                        os.remove(filepath)
                os.rmdir(self.temp_dir)
            
            logging.info("AnalysisManager limpiado correctamente")
            
        except Exception as e:
            logging.error(f"Error en limpieza de AnalysisManager: {e}")