import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from datetime import datetime

# Cargar credenciales desde .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

def funcion_verificar_conexion():
    # Create a new client and connect to the server
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

def funcion_insertar_datos_prueba():

    client = MongoClient(MONGO_URI)
    # Conectar a MongoDB Atlas
    db = client["principal"]  # Cambia el nombre si quieres
    # Documento para lecturas_sensores
    lectura = {
        "hora_fecha": datetime(2025, 6, 19, 14, 0),
        "iluminacion": 230,
        "temperatura": 26.5,
        "humedad": 60
    }

    # Documento para estadisticas_resultados
    estadisticas = {
        "hora_fecha": datetime(2025, 6, 19, 14, 0),
        "sensor_de": "temperatura",
        "media": 25.7,
        "varianza": 0.5
    }

    # Documento para predicciones
    prediccion = {
        "hora_fecha": datetime(2025, 6, 19, 15, 0),
        "sensor_de": "temperatura",
        "mediaMovil": 26.0,
        "suavizado": 25.8
    }

    # Documento para alertas
    alerta = {
        "hora_fecha": datetime(2025, 6, 19, 14, 5),
        "sensor_de": "temperatura",
        "valor": "umbral_superado"
    }

    # Insertar documentos
    db.lecturas_sensores.insert_one(lectura)
    db.estadisticas_resultados.insert_one(estadisticas)
    db.predicciones.insert_one(prediccion)
    db.alertas.insert_one(alerta)

    print("📥 Datos insertados exitosamente en MongoDB Atlas")


def main():
    funcion_verificar_conexion()
    funcion_insertar_datos_prueba()

main()