# mq135_reader.py
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn

class MQ135Reader:
    def __init__(self, ads=None, channel=1):
        if ads is None:
            raise ValueError("Debe proporcionar una instancia de ADS1115")
        if channel == 0:
            self.channel = AnalogIn(ads, ADS1115.P0)
        elif channel == 1:
            self.channel = AnalogIn(ads, ADS1115.P1)
        elif channel == 2:
            self.channel = AnalogIn(ads, ADS1115.P2)
        elif channel == 3:
            self.channel = AnalogIn(ads, ADS1115.P3)
        else:
            raise ValueError("Canal inválido para ADS1115")

    def read(self):
        return round(self.channel.voltage, 3)
