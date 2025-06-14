from gpiozero import LED, DigitalOutputDevice, PWMOutputDevice, Buzzer
from globals import shared
import threading


class Actuators:

    def __init__(self):
        # Declaración de LEDs
        self.red_led = LED(17)
        self.yellow_led = LED(22)
        self.green_led = LED(10)
        self.blue_led = LED(9)

        # Iluminacion del vivero
        self.iluminacion = LED(20)

        # Declaración del motor con puente H
        self.motor_in1 = DigitalOutputDevice(5)  # IN1
        self.motor_in2 = DigitalOutputDevice(6)  # IN2
        self.motor_enable = PWMOutputDevice(13)  # EN (PWM)

        # Buzzer
        self.buzzer = PWMOutputDevice(21)

        # Diccionario para timers automáticos
        self.auto_off_timers = {}

        

        self.turn_off_all()
        print("Actuadores inicializados Correctamente")
        self.normal_off_timers = {}

    def turn_off_all(self):
        self.red_led.off()
        self.yellow_led.off()
        self.green_led.off()
        self.blue_led.off()
        self.motor_enable.off()
        self.motor_in1.off()
        self.motor_in2.off()
        self.buzzer.off()
        self.iluminacion.off()

        for key in shared.actuator_status:
            shared.actuator_status[key] = False

    def control_led(self, led_obj, led_name, state):
        if state:
            led_obj.on()
        else:
            led_obj.off()
        shared.actuator_status[led_name] = state

######################### Actuadores de Temperatura ##########################
    def control_motor(self, state_global, state_control):
        if state_global and state_control:
            print("MOTOR ENCENDIDO AUTOMATICO")
            self.motor_in1.on()
            self.motor_in2.off()  # dirección fija
            self.motor_enable.value = 1.0  # 100% velocidad
            shared.actuator_status["motor_fan"] = True

        elif state_global == False and state_control == True:
            print("MOTOR ENCENDIDO MANUAL")
            self.motor_in1.on()
            self.motor_in2.off()  # dirección fija
            self.motor_enable.value = 1.0  # 100% velocidad
            shared.actuator_status["motor_fan"] = True
        else:
            #print("MOTOR APAGADO: modo: ", state_global, " control: ", state_control)
            self.auto = threading.Timer(5, self._auto_off_motor)
            self.auto.start()

    def _auto_off_motor(self):
        self.motor_enable.off()
        self.motor_in1.off()
        self.motor_in2.off()
        shared.actuator_status["motor_fan"] = False
        print("Motor apagado")


    def control_led_Red(self,state_global, state_control):
        if(state_global and state_control): 
            self.red_led.on()
            print("Led Rojo encendido automaticamente")           
        elif(state_global == False and state_control == True): 
            self.red_led.on()
            print("Led Rojo encendido manualmente")
        else: 
            time = threading.Timer(5, self._auto_off_led_red)
            time.start()
    
    def _auto_off_led_red(self):
        self.control_led(self.red_led, "red_led", False)
        print("Led roja Apagada")
    
################################ Actuadores de calidad del aire ################################

    def control_buzzer(self, state_global, state_control):
        if (state_global and state_control):
            self.buzzer.frequency = 2000
            self.buzzer.value = 0.5
            print("Buzzer aencendido manualmente")  
        elif(state_global == False and state_control == True): 
            self.buzzer.frequency = 2000
            self.buzzer.value = 0.5    
            print("Buzzer aencendido manualmente")    
        else:

            timer = threading.Timer(5, self._auto_off_buzzer)
            timer.start()
           

    def _auto_off_buzzer(self):
        self.buzzer.off()
        shared.actuator_status["buzzer"] = False
        #elf.control_led(self.blue_led, "blue_led", False)
        print("Buzzer apagado")

    def control_led_blue(self, state_global, state_control ):
        if (state_global and state_control):
            self.blue_led.on()
            print("Led azul automaticamnte")
        elif(state_global == False and state_control == True): 
            self.blue_led.on()
            print("Led azul Manuel")
        else:
            time = threading.Timer(5, self._auto_off_led_blue)
            time.start()
            print("Led azul apagadol")

    def _auto_off_led_blue(self):
        self.control_led(self.blue_led, "blue_led", False)

############################ Actuadores de Iluminacion ##############################################
    def control_iluminacion(self, state):
        if state:
            print("Encender Iluminacion")
            self.iluminacion.on()
        else:
            print("Iluminacion Apagada")
            self.iluminacion.off()
        
    def control_led_gren(self, state_global, state_control ):
        if (state_global and state_control):
            self.green_led.on()
            print("Led verde automaticamnte")
        elif(state_global == False and state_control == True): 
            self.green_led.on()
            print("Led verde Manuel")
        else:
            time = threading.Timer(5, self._auto_off_led_green)
            time.start()
            print("Led verde apagadol")

    def _auto_off_led_green(self):
        self.control_led(self.green_led, "green_led", False)
############################## Actuadores de Humedad #########################################
    def control_led_yellow(self, state_global, state_control ):
        if (state_global and state_control):
            self.yellow_led.on()
            print("Led amarillo encendido automaticamnte")
        elif(state_global == False and state_control == True): 
            self.yellow_led.on()
            print("Led amarillo Manuel")
        else:
            time = threading.Timer(5, self._auto_off_led_yellow)
            time.start()
            print("Led amarillo apagadol")

    def _auto_off_led_yellow(self):
        self.control_led(self.yellow_led, "yellow_led", False)

################################# checkeo de actuadores y estados ##########################################
    def check_alerts_and_control(self):
    
    ######################################### Temperatura ##################################
        if (
            shared.temperature > shared.thresholds["temperature_max"]
            or shared.temperature < shared.thresholds["temperature_min"]
        ):
            print(f"  Alerta de temperatura: {shared.temperature}°C")
            shared.alert_status["temperature"] = True
            shared.local_error_message = "Temperatura Critica!"
            self.control_led_Red(shared.modo_control, shared.actuadores["red_led"])
            self.control_motor(shared.modo_control, shared.actuadores["motor_fan"])
        else:
            shared.alert_status["temperature"] = False
            if not (shared.modo_control):
                self.control_motor(shared.modo_control, shared.actuadores["motor_fan"])
                self.control_led_Red(shared.modo_control, shared.actuadores["red_led"])
            else:
                self.control_motor(True, False)
                shared.estado_motor_fan = False
                self.control_led_Red(True, False)

    ######################################### Humedad ##################################
        if (
            shared.humidity > shared.thresholds["humidity_max"]
            or shared.humidity < shared.thresholds["humidity_min"]
        ):
            if not shared.alert_status["humidity"]:
                print(f"  Alerta de humedad: {shared.humidity}%")
                self.control_led_yellow(shared.modo_control,shared.actuadores["yellow_led"])
                shared.alert_status["humidity"] = True
                shared.local_error_message = "Humedad Critica!"
        else:
            shared.alert_status["humidity"] = False
            if not (shared.modo_control):  
                self.control_led_yellow(shared.modo_control,shared.actuadores["yellow_led"])
            else:  
                self.control_led_yellow(True,False)

        ######################################### Luz ##################################

        if shared.light_level < shared.thresholds["light_min"]:
            if not shared.alert_status["light"]:
                print(f" Alerta por baja luz: {shared.light_level}%")
                self.control_led_gren(shared.modo_control,shared.actuadores["green_led"])
                self.control_iluminacion(True)
                shared.alert_status["light"] = True
                shared.local_error_message = "Iluminacion Baja!"
        else:
            shared.alert_status["light"] = False
            if not (shared.modo_control): 
                self.control_led_gren(shared.modo_control,shared.actuadores["green_led"])
                #self.control_iluminacion(True)   
            else:  
                self.control_led_gren(True, False)
                self.control_iluminacion(False)

        ######################################### calidad de Aire ##################################
        if shared.air_quality < shared.thresholds["air_quality_min"]:
            print(f"  Alerta de calidad del aire: {shared.air_quality}")
            self.control_led_blue(shared.modo_control,shared.actuadores["blue_led"])
            self.control_buzzer(shared.modo_control,shared.actuadores["buzzer"])
            shared.alert_status["air_quality"] = True
            shared.local_error_message = "Mala Calidad de Aire!"
        else:
            shared.alert_status["air_quality"] = False
            if not (shared.modo_control):
                print(f"  Calidad de Aire normalizada: {shared.temperature}")
                shared.alert_status["air_quality"] = False
                self.control_buzzer(shared.modo_control,shared.actuadores["buzzer"])
                self.control_led_blue(shared.modo_control,shared.actuadores["blue_led"])
            else:
                self.control_buzzer(True,False)
                self.control_led_blue(True,False)


        ######################################### Distancia ##################################
        if (
            shared.thresholds["presence_distance_min"]
            <= shared.thresholds["presence_distance_max"]
        ):

            if not shared.alert_status["presence"]:
                print(f" Presencia detectada: {shared.distance}cm")
                shared.alert_status["presence"] = True
        else:
            shared.alert_status["presence"] = False

    def cleanup(self):
        for timer in self.auto_off_timers.values():
            if timer.is_alive():
                timer.cancel()
        self.turn_off_all()
        print("Actuadores limpiados")
