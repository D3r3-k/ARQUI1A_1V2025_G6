"use client";

import {
  TopicAmbient,
  HistoryItem,
  TopicHistoryStack,
} from "@/types/TypesMqtt";
import mqtt, { MqttClient } from "mqtt";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

type TopicName = string;

interface MqttContextType {
  isConnected: boolean;
  ambientTopics: Record<TopicName, TopicAmbient | undefined>;
  infoTopics: Record<TopicName, TopicAmbient | undefined>;
  stackTopics: Record<TopicName, TopicHistoryStack | undefined>;
  publish: (topic: string, message: string) => void;
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
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};
