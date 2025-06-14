"use client";

import {
  TopicAmbient,
  HistoryItem,
  TopicHistoryStack,
} from "@/types/TypesMqtt";
import mqtt, { MqttClient } from "mqtt";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type TopicName = string;

type AlertItem = {
  sensor: AlertKey;
  mensaje: string;
  fulldate: string;
};



interface MqttContextType {
  isConnected: boolean;
  ambientTopics: Record<TopicName, TopicAmbient | undefined>;
  infoTopics: Record<TopicName, TopicAmbient | undefined>;
  stackTopics: Record<TopicName, TopicHistoryStack | undefined>;
  publish: (topic: string, message: string) => void;
  activeAlerts: AlertItem[];
  alertCount: number; // nuevo
}

export const MqttContext = createContext<MqttContextType | undefined>(undefined);

const STACKEABLE_TOPICS = [
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/temperatura`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/humedad`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/luz`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/calidad_aire`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/presion`,
];
const INFO_TOPICS = [
  ...STACKEABLE_TOPICS,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/distancia`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/info`,
  `${process.env.NEXT_PUBLIC_TOPICS_LINK}/alertas`,
];
const alertTopic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/alertas`;

type AlertKey = "temperature" | "humidity" | "light" | "air_quality" | "presence";
const messageAlerts: Record<AlertKey, string> = {
  temperature: "Temperatura fuera del rango óptimo para el vivero de plantas.",
  humidity: "Humedad inadecuada detectada en el vivero.",
  light: "Niveles de iluminación no adecuados para el crecimiento de las plantas.",
  air_quality: "Calidad del aire comprometida en el vivero.",
  presence: "Se ha detectado presencia no autorizada en el vivero.",
};

const STACK_STORAGE_KEY = "mqttStackTopics";
const INFO_STORAGE_KEY = "mqttInfoTopics";

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<MqttClient | null>(null);

  // Carga inicial desde localStorage
  const [stackTopics, setStackTopics] = useState<Record<TopicName, TopicHistoryStack>>(() => {
    try {
      const saved = localStorage.getItem(STACK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [infoTopics, setInfoTopics] = useState<Record<TopicName, TopicAmbient>>(() => {
    try {
      const saved = localStorage.getItem(INFO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [ambientTopics, setAmbientTopics] = useState<Record<TopicName, TopicAmbient>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const formatTimestamp = (ts: number | string): string => {
    const date = new Date(Number(ts));
    const time = date.toLocaleTimeString("es-ES");
    const day = date.toLocaleDateString("es-ES");
    return `${time} ${day}`;
  };


  // Guarda stacks en localStorage al cambiar
  useEffect(() => {
    try {
      localStorage.setItem(STACK_STORAGE_KEY, JSON.stringify(stackTopics));
    } catch (e) {
      console.warn("Error guardando stacks MQTT en localStorage", e);
    }
  }, [stackTopics]);
  // Guarda informativos si lo deseas:
  useEffect(() => {
    try {
      localStorage.setItem(INFO_STORAGE_KEY, JSON.stringify(infoTopics));
    } catch (e) {
      console.warn("Error guardando info MQTT en localStorage", e);
    }
  }, [infoTopics]);

  // Inicializa y suscribe al conectar
  useEffect(() => {
    const client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL || "mqtt://localhost:1883");
    clientRef.current = client;

    client.on("connect", () => {
      console.log("Conectado al broker MQTT");
      setIsConnected(true);
      INFO_TOPICS.forEach((t) => client.subscribe(t));
    });

    client.on("error", (err) => {
      console.error("MQTT error", err);
    });

    client.on("message", (topic, message) => {
      try {
        const msg: TopicAmbient = JSON.parse(message.toString());
        // Actualiza info (último dato recibido)
        setInfoTopics((prev) => ({
          ...prev,
          [topic]: msg,
        }));

        // Si es stackeable, actualiza la pila de históricos
        if (STACKEABLE_TOPICS.includes(topic)) {
          setStackTopics((prev) => {
            const prevArr = prev[topic]?.history ?? [];
            const newItem: HistoryItem = {
              timestamp: msg.timestamp,
              value: String(msg.value),
            };
            const history = [...prevArr, newItem].slice(-20);
            return {
              ...prev,
              [topic]: { history },
            };
          });
        }
        setAmbientTopics((prev) => ({
          ...prev,
          [topic]: msg,
        }));
      } catch (e) {
        console.error("Error parseando mensaje MQTT", topic, e);
      }
    });

    return () => {
      client.end(true)
    };
  }, []);


  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    let prevAlertStates: Record<AlertKey, boolean> = {
      air_quality: false,
      humidity: false,
      light: false,
      presence: false,
      temperature: false,
    };

    const handleAlertMessage = (topic: string, message: Buffer) => {
      if (topic === alertTopic) {
        const alertData = JSON.parse(message.toString());

        let anyNewAlert = false;

        Object.entries(alertData.alerts).forEach(([key, value]) => {
          if (
            (["temperature", "humidity", "light", "air_quality", "presence"] as string[]).includes(key)
          ) {
            const sensor = key as AlertKey;
            const mensaje = messageAlerts[sensor];

            // Si es false, eliminar la alerta de la pila
            if (!value) {
              setActiveAlerts((prev) =>
                prev.filter((alert) => alert.sensor !== sensor)
              );
            } else {
              // Si la alerta aún no está activa, agregarla
              setActiveAlerts((prev) => {
                const exists = prev.some((a) => a.sensor === sensor);
                if (exists) return prev;
                const fulldate = formatTimestamp(Date.now());
                const newAlert: AlertItem = { sensor, mensaje, fulldate };
                return [...prev, newAlert];
              });
            }

            // Solo marcar como nueva alerta si antes era false y ahora true
            if (!prevAlertStates[sensor] && value) {
              anyNewAlert = true;
            }
          }
        });

        prevAlertStates = { ...alertData.alerts };

        if (anyNewAlert) {
          toast.info("Nueva alerta", {
            position: "top-right",
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    };

    client.subscribe(alertTopic);
    client.on("message", handleAlertMessage);

    return () => {
      client.unsubscribe(alertTopic);
      client.off("message", handleAlertMessage);
    };
  }, []);


  const publish = (topic: string, message: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish(topic, message, (err) => {
        if (err) console.error(`Error al publicar en ${topic}:`, err);
      });
    }
  };

  return (
    <MqttContext.Provider
      value={{
        isConnected,
        ambientTopics,
        infoTopics,
        stackTopics,
        publish,
        activeAlerts, // nuevo
        alertCount: activeAlerts.length, // nuevo
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};
