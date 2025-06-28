import { useContext } from "react";
import { MqttContext } from "@/context/MqttContext";

export const useMqtt = () => {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error("useMqtt debe usarse dentro de MqttProvider");
  return ctx;
};
