from globals import shared
def Generar_historicos_temperatura(valor,hora,fecha):
    if(shared.HTemperatura["history"]) >= 20:
        shared.HTemperatura["history"].pop(0)

        nuevo_dato ={
            "date": fecha,
            "hora": hora,
            "valor":valor,
        }
        shared.HTemperatura["history"].appeden(nuevo_dato)

def Generar_historicos_humedad(valor,hora,fecha):
    if(shared.HHumedad["history"]) >= 20:
        shared.HHumedad["history"].pop(0)

        nuevo_dato ={
            "date": fecha,
            "hora": hora,
            "valor":valor,
        }
        shared.HHumedad["history"].appeden(nuevo_dato)

def Generar_historicos_presion(valor,hora,fecha):
    if(shared.HPresion["history"]) >= 20:
        shared.HPresion["history"].pop(0)

        nuevo_dato ={
            "date": fecha,
            "hora": hora,
            "valor":valor,
        }
        shared.HPresion["history"].appeden(nuevo_dato)

def Generar_historicos_Luz(valor,hora,fecha):
    if(shared.HLuz["history"]) >= 20:
        shared.HLuz["history"].pop(0)

        nuevo_dato ={
            "date": fecha,
            "hora": hora,
            "valor":valor,
        }
        shared.HLuz["history"].appeden(nuevo_dato)