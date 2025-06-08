"use client";

import { TopicActivity, TopicAmbient, TopicControl, TopicDashboard, TopicHistory } from '@/types/TypesMqtt';
import mqtt, { MqttClient } from 'mqtt';
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

interface MqttContextType {
    client: MqttClient | null;
    isConnected: boolean;
    messages: {
        [topic: string]: TopicDashboard | TopicAmbient | TopicActivity | TopicHistory | TopicControl;
    };
    subscribe: (topic: string) => void;
    publish: (topic: string, message: string) => void;
}

export const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
    // Hook's
    const clientRef = useRef<MqttClient | null>(null);
    // State's
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<{
        [topic: string]: TopicDashboard | TopicAmbient | TopicActivity | TopicHistory | TopicControl;
    }>({});

    // Effect's
    useEffect(() => {
        // Recuperar mensajes guardados
        const savedMessages = localStorage.getItem('mqttMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }

        const client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'mqtt://localhost:1883');

        clientRef.current = client;

        client.on('connect', () => {
            setIsConnected(true);
            console.log('MQTT conectado');
        });

        client.on('error', (err) => {
            console.error('MQTT error', err);
        });

        client.on('message', (topic, message) => {
            const msgStr: TopicDashboard | TopicAmbient | TopicActivity | TopicHistory | TopicControl = JSON.parse(message.toString());
            console.log(`Mensaje recibido en el topic ${topic}:`, msgStr);
            setMessages((prev: any) => {
                const updated = { ...prev, [topic]: msgStr };
                localStorage.setItem('mqttMessages', JSON.stringify(updated));
                return updated;
            });
        });

        return () => {
            client.end(true);
        };
    }, []);

    // Handler's
    const subscribe = (topic: string) => {
        if (clientRef.current && isConnected) {
            clientRef.current.subscribe(topic, (err) => {
                if (err) console.error(`Error al suscribirse a ${topic}:`, err);
            });
        }
    };
    const publish = (topic: string, message: string) => {
        if (clientRef.current && isConnected) {
            clientRef.current.publish(topic, message, (err) => {
                if (err) console.error(`Error al publicar en ${topic}:`, err);
            });
        }
    };
    // Render's
    return (
        <MqttContext.Provider value={{ client: clientRef.current, isConnected, messages, subscribe, publish }}>
            {children}
        </MqttContext.Provider>
    );
};
