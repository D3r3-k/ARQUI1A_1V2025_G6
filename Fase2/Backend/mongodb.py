import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from datetime import datetime

# Cargar credenciales desde .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
# Conectar a MongoDB Atlas
db = client["principal"]  # Cambia el nombre si quieres

##-------------------funciones para insertar datos en MongoDB Atlas-------------------##

def ingresar_lectura(hora_fecha, iluminacion, temperatura, humedad, presion,calidad_aire,distancia):
    lectura = {
        "hora_fecha": hora_fecha,
        "iluminacion": iluminacion,
        "temperatura": temperatura,
        "humedad": humedad,
        "presion": presion,
        "calidad_aire": calidad_aire,
        "distancia": distancia
    }
    db.lecturas_sensores.insert_one(lectura)
    print(" Lectura insertada exitosamente en MongoDB Atlas")

def insertar_estadisticas(sensor_de, hora_fecha, media, mediana ,moda , MinMax , desviacion ,varianza,):
    estadisticas = {
        "hora_fecha": hora_fecha,
        "sensor_de": sensor_de,
        "media": media,
        "mediana": mediana,
        "moda": moda,
        "Minimo / maximo ": MinMax,
        "Desviacion Estandar" : desviacion, 
        "varianza": varianza
    }
    db.estadisticas_resultados.insert_one(estadisticas)
    print(" Estadísticas insertadas exitosamente en MongoDB Atlas")

def insertar_prediccion(sensor_de, hora_fecha, mediaMovil, suavizado):
    prediccion = {
        "hora_fecha": hora_fecha,
        "sensor_de": sensor_de,
        "mediaMovil": mediaMovil,
        "suavizado": suavizado
    }
    db.predicciones.insert_one(prediccion)
    print(" Predicción insertada exitosamente en MongoDB Atlas")

def insertar_alerta(sensor_de, hora_fecha, valor):
    alerta = {
        "hora_fecha": hora_fecha,
        "sensor_de": sensor_de,
        "valor": valor
    }
    db.alertas.insert_one(alerta)
    print(" Alerta insertada exitosamente en MongoDB Atlas")

##-------------------funciones para consultar datos en MongoDB Atlas-------------------##
def consultar_lecturas(cantidad=10):
    cursor = db.lecturas_sensores.find().sort("hora_fecha", -1).limit(cantidad)
    print('LLamada correcta')
    return list(cursor)

def consultar_estadisticas(cantidad=10):
    cursor = db.estadisticas_resultados.find().sort("hora_fecha", -1).limit(cantidad)
    return list(cursor)

def consultar_predicciones(cantidad=10):
    cursor = db.predicciones.find().sort("hora_fecha", -1).limit(cantidad)
    return list(cursor)

def consultar_alertas(cantidad=10):
    cursor = db.alertas.find().sort("hora_fecha", -1).limit(cantidad)
    return list(cursor)