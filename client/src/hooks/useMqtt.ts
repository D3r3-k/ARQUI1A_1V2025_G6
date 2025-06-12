import { MqttContext } from "@/context/MqttContext";
import { useContext } from "react";

export const useMqtt = () => {
    const context = useContext(MqttContext);
    if (!context) {
        throw new Error('useMqtt debe usarse dentro de un MqttProvider');
    }
    return context;
};