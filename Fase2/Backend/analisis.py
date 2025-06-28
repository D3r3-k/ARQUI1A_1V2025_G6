import os
import subprocess
import logging
import tempfile
import json
from datetime import datetime
from globals import shared
import mongodb
import mqtt

class AnalysisManager:
    
    def __init__(self):
        # Configuración de paths y archivos
        self.temp_dir = "./Arm/analysis_files" 
        self.arm64_stats_executable = "./Arm/build/main"  # Path de estadísticas
        self.arm64_pred_executable = "./Arm/build/main"  # Path de predicciones
        
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
        """
        Procesa TODOS los cálculos (estadísticas + predicciones) para un sensor específico
        """
        try:
            # Normalizar nombre del sensor
            normalized_sensor = self.sensor_mapping.get(sensor_name.lower())
            if not normalized_sensor:
                logging.error(f"Sensor no reconocido: {sensor_name}")
                return False

            logging.info(f"Iniciando cálculos completos (estadísticas + predicciones) para sensor: {normalized_sensor}")
            
            # 1. Consultar datos de MongoDB
            data = self._get_sensor_data(normalized_sensor, 30)
            if not data:
                logging.warning(f"No se encontraron datos para el sensor: {normalized_sensor}")
                return False

            # 2. Crear archivo temporal con datos
            input_file = self._create_data_file(data, f"complete_input_{normalized_sensor}")
            if not input_file:
                return False

            # 3. TESTING: Solo mostrar que se creó el archivo
            logging.info(f"✓ Archivo de entrada creado exitosamente: {input_file}")
            logging.info(f"✓ Datos obtenidos de MongoDB: {len(data)} valores")
            logging.info(f"✓ Primeros 5 valores: {data[:5] if len(data) >= 5 else data}")
            
            
            output_file = f"{self.temp_dir}/complete_output_{normalized_sensor}.txt"
            success = self._execute_arm64_complete(input_file, output_file)
            
            if success:
                # 4. Procesar TODOS los resultados de una vez
                results = self._parse_all_results(output_file, normalized_sensor)
                
                if results:
                    # 5. Guardar en MongoDB (ambos tipos)
                    self._save_to_mongo(results, normalized_sensor)
                    # 6. Actualizar TODAS las variables globales
                    self._update_all_shared_variables(results, normalized_sensor)
                    
                    logging.info(f"Cálculos completos exitosos para {normalized_sensor}")
                    return True
            
            return False
            
            # SIMULACIÓN DE ÉXITO PARA TESTING
            # shared.local_error_message = f"Test Complete {normalized_sensor} - File OK"
            
            # ===== PARA TESTING =====
            # Simular que se actualizaron los resultados
            # shared.ultima_media = 25.5 if normalized_sensor == "temperature" else 82.0
            # shared.ultima_mediana = 25.0 if normalized_sensor == "temperature" else 82.0
            # shared.ultimo_sensor_estadisticas = normalized_sensor
            # shared.ultima_media_movil = 25.2 if normalized_sensor == "temperature" else 81.8
            # shared.ultimo_sensor_predicciones = normalized_sensor
            
            # actaulizacion de bandera
            # shared.new_analysis_results_ready = True
            # ============================================
            
            # logging.info(f"TESTING: Cálculos completos simulados para {normalized_sensor}")
            # return True
            
        except Exception as e:
            logging.error(f"Error procesando cálculos completos para {sensor_name}: {e}")
            return False
        finally:
            # COMENTADO PARA TESTING - No borrar archivos para poder revisarlos
            # self._cleanup_temp_files([input_file, output_file])
            logging.info(f"TESTING: Archivo temporal conservado en: {input_file}")
            pass


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

    def _execute_arm64_complete(self, input_file, output_file):
        """
        Ejecuta ARM64 con delays y captura stdout en tiempo real
        """
        try:
            arm64_file = self._convert_to_arm64_format(input_file)
            if not arm64_file:
                return False

            current_dir = os.path.dirname(os.path.abspath(__file__))
            executable_path = os.path.join(current_dir, "Arm", "build", "main")
            build_dir = os.path.join(current_dir, "Arm", "build")

            if not os.path.exists(executable_path):
                logging.error("❌ Ejecutable no encontrado")
                return False

            filename = os.path.basename(arm64_file)
            logging.info(f"🚀 Ejecutando con delays - Archivo: {filename}")

            import threading
            import queue
            import time

            def read_stdout(process, stdout_queue):
                try:
                    for line in iter(process.stdout.readline, ''):
                        stdout_queue.put(line)
                    process.stdout.close()
                except:
                    pass

            process = subprocess.Popen(
                [executable_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=build_dir,
                bufsize=1
            )

            stdout_queue = queue.Queue()
            stdout_thread = threading.Thread(target=read_stdout, args=(process, stdout_queue))
            stdout_thread.daemon = True
            stdout_thread.start()

            def send_command_safely(cmd, delay=1):
                if process.poll() is not None:
                    logging.warning(f"⚠️ Proceso terminó antes de enviar: {cmd}")
                    return False
                try:
                    process.stdin.write(f"{cmd}\n")
                    process.stdin.flush()
                    time.sleep(delay)
                    return True
                except (BrokenPipeError, ValueError):
                    logging.warning(f"⚠️ Error al enviar: {cmd}")
                    return False

            # Enviar los comandos
            if not send_command_safely("3", 1): return False
            if not send_command_safely(filename, 1): return False
            if not send_command_safely("1", 1): return False
            if not send_command_safely("8", 2): return False
            if not send_command_safely("9", 1): return False
            if not send_command_safely("6", 0): return False

            # ✅ Ahora sí cerramos stdin
            try:
                process.stdin.close()
                logging.info("✅ stdin cerrado correctamente")
            except Exception:
                logging.info("ℹ️ stdin ya estaba cerrado")

            logging.info("⏳ Recopilando stdout...")

            stdout_lines = []
            timeout_count = 0
            max_timeout = 50  # 5 segundos

            while timeout_count < max_timeout:
                try:
                    line = stdout_queue.get(timeout=0.1)
                    stdout_lines.append(line)
                    timeout_count = 0
                except queue.Empty:
                    timeout_count += 1
                    if process.poll() is not None:
                        break

            while not stdout_queue.empty():
                try:
                    stdout_lines.append(stdout_queue.get_nowait())
                except queue.Empty:
                    break

            # ✅ Esperamos que el proceso termine
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
                logging.error("⚠️ Proceso ARM64 se colgó, fue terminado manualmente")

            stderr = process.stderr.read()
            stdout = ''.join(stdout_lines)

            logging.info(f"🎯 Return code: {process.returncode}")
            logging.info(f"📄 Stdout recopilado: {len(stdout)} caracteres")
            if stdout:
                logging.info(f"📄 Stdout (preview): {stdout[:500]}")
            else:
                logging.warning("⚠️ No se recibió stdout")

            if stderr:
                logging.warning(f"⚠️ Stderr: {stderr[:300]}")

            if stdout and len(stdout) > 50:
                with open(output_file, 'w') as f:
                    f.write(stdout)
                logging.info("✅ ARM64 ejecutado exitosamente")
                return True
            else:
                logging.error(f"❌ Stdout insuficiente o proceso falló")
                return False

        except Exception as e:
            logging.error(f"❌ Error general: {e}")
            return False

    def _convert_to_arm64_format(self, input_file):
        """
        Convierte el archivo de Python al formato que acepta ARM64
        """
        try:
            # Leer datos del archivo original
            with open(input_file, 'r') as f:
                content = f.read()
            
            # Extraer números
            numbers = []
            for line in content.strip().split('\n'):
                line = line.strip()
                if line and line != '$': 
                    try:
                        # Convertir a entero (formato que acepta ARM64)
                        numbers.append(int(float(line)))
                    except:
                        continue
            
            if not numbers:
                logging.error("No se encontraron números válidos")
                return None
            
            # Crear archivo en el directorio build (desde Backend/)
            build_dir = "./Arm/build"  # Desde Backend/ hacia Arm/build/
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"sensor_data_{timestamp}.txt"
            filepath = os.path.join(build_dir, filename)
            
            with open(filepath, 'w') as f:
                for num in numbers:
                    f.write(f"{num}\n")
                f.write("$\n")
            
            logging.info(f"Archivo ARM64 creado: {filepath} ({len(numbers)} valores)")
            return filepath
            
        except Exception as e:
            logging.error(f"Error convirtiendo archivo: {e}")
            return None

    def _parse_all_results(self, output_file, sensor_name):
        """
        Parsea TODOS los resultados del archivo ARM64 y extrae todo directamente
        """
        try:
            if not os.path.exists(output_file):
                logging.error(f"Archivo de resultados no encontrado: {output_file}")
                return None

            results = {}
            
            with open(output_file, 'r') as f:
                content = f.read().strip()
            
            lines = content.split('\n')
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    try:
                        value = float(value.strip())
                        results[key] = value
                    except ValueError:
                        continue
            
            logging.debug(f"Todos los resultados parseados: {results}")
            return results
            
        except Exception as e:
            logging.error(f"Error parseando todos los resultados: {e}")
            return None

    def _save_to_mongo(self, results, sensor_name):
        """
        Guarda AMBOS tipos de resultados en MongoDB
        """
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Guardar estadísticas si existen
            if any(key in results for key in ['media', 'mediana', 'moda', 'minimo', 'maximo', 'desviacion', 'varianza']):
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
            
            # Guardar predicciones si existen
            if any(key in results for key in ['media_movil', 'suavizado_exponencial']):
                mongodb.insertar_prediccion(
                    sensor_de=sensor_name,
                    hora_fecha=timestamp,
                    mediaMovil=results.get('media_movil', 0),
                    suavizado=results.get('suavizado_exponencial', 0)
                )
                logging.info(f"Predicciones guardadas en MongoDB para {sensor_name}")
            
        except Exception as e:
            logging.error(f"Error guardando resultados en MongoDB: {e}")

    def _update_all_shared_variables(self, results, sensor_name):
        """
        Actualiza TODAS las variables globales de una vez
        """
        try:
            # Actualizar estadísticas
            shared.ultima_media = results.get('media', 0.0)
            shared.ultima_mediana = results.get('mediana', 0.0)
            shared.ultima_moda = results.get('moda', 0.0)
            shared.ultimo_minimo = results.get('minimo', 0.0)
            shared.ultimo_maximo = results.get('maximo', 0.0)
            shared.ultima_desviacion = results.get('desviacion', 0.0)
            shared.ultima_varianza = results.get('varianza', 0.0)
            shared.ultimo_sensor_estadisticas = sensor_name
            
            # Actualizar predicciones
            shared.ultima_media_movil = results.get('media_movil', 0.0)
            shared.ultimo_suavizado_exponencial = results.get('suavizado_exponencial', 0.0)
            shared.ultimo_sensor_predicciones = sensor_name

            
            logging.info(f"TODAS las variables globales actualizadas para {sensor_name}")
            
            shared.new_analysis_results_ready = True
            
        except Exception as e:
            logging.error(f"Error actualizando variables globales: {e}")


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
        return {
            'media': getattr(shared, 'ultima_media', 0.0),
            'mediana': getattr(shared, 'ultima_mediana', 0.0),
            'moda': getattr(shared, 'ultima_moda', 0.0),
            'minimo': getattr(shared, 'ultimo_minimo', 0.0),
            'maximo': getattr(shared, 'ultimo_maximo', 0.0),
            'desviacion': getattr(shared, 'ultima_desviacion', 0.0),
            'varianza': getattr(shared, 'ultima_varianza', 0.0),
            'sensor': getattr(shared, 'ultimo_sensor_estadisticas', '')
        }

    def get_latest_predictions(self, sensor_name=None):
        """
        Obtiene las últimas predicciones calculadas
        """
        return {
            'media_movil': getattr(shared, 'ultima_media_movil', 0.0),
            'suavizado_exponencial': getattr(shared, 'ultimo_suavizado_exponencial', 0.0),
            'sensor': getattr(shared, 'ultimo_sensor_predicciones', '')
        }

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