"use client";

import {
  AlertTriangle,
  AudioLines,
  Calendar,
  ChartSpline,
  Droplets,
  Fan,
  Lightbulb,
  RefreshCw,
  SunSnow,
  ToggleLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import ControlCard from "./components/ControlCard/ControlCard";
import { useMqtt } from "@/hooks/useMqtt";
import { TopicModoControl } from "@/types/TypesMqtt";

const topic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/modo`;

export default function ControlPage() {
  // Hook's
  const { publish } = useMqtt();
  // State's
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  // Effect's
  useEffect(() => {
    // Check localStorage for control mode
    const storedMode = localStorage.getItem("actuadoresModo");
    if (storedMode) {
      setIsAutoMode(JSON.parse(storedMode));
    }
    return () => {};
  }, []);

  // Handler's
  const handleAutoModeToggle = () => {
    if (isAutoMode) return;
    setIsAutoMode(true);
    localStorage.setItem("actuadoresModo", JSON.stringify(true));
    const newControlData: TopicModoControl = {
      modo: true,
    };
    publish(topic, JSON.stringify(newControlData));
  };
  const handleManualModeToggle = () => {
    if (!isAutoMode) return;
    setIsAutoMode(false);
    localStorage.setItem("actuadoresModo", JSON.stringify(false));
    const newControlData: TopicModoControl = {
      modo: false,
    };
    publish(topic, JSON.stringify(newControlData));
  };
  // Render's
  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Control Mode */}
        <div className="p-5 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Control de Actuadores</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isAutoMode
                  ? "Modo automático: Los actuadores funcionan según las reglas programadas"
                  : "Modo manual: Controle directamente cada actuador"}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAutoModeToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-300 cursor-pointer
                  ${
                    isAutoMode
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  }`}
              >
                <RefreshCw size={16} />
                <span>Automático</span>
              </button>
              <button
                onClick={handleManualModeToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-300 cursor-pointer
                  ${
                    !isAutoMode
                      ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                      : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  }`}
              >
                <ToggleLeft size={16} />
                <span>Manual</span>
              </button>
            </div>
          </div>
        </div>
        {/* Calendar/Schedule (Preview) */}
        <div className="p-5 bg-white dark:bg-gray-900 flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Visualizacion LCD</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center space-x-3 rounded-md p-3 border cursor-pointer ${
                  i === 1
                    ? "border-cyan-600 bg-cyan-600/20 dark:bg-cyan-600/30"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                }`}
              >
                <div
                  className={`rounded-md p-2 ${
                    i === 1
                      ? "bg-cyan-600/40 dark:bg-cyan-600/30 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {i === 1 && <SunSnow size={16} />}
                  {i === 2 && <ChartSpline size={16} />}
                  {i === 3 && <AlertTriangle size={16} />}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-medium">
                    {i === 1 && "Tiempo real"}
                    {i === 2 && "Predicciones"}
                    {i === 3 && "Alertas"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {i === 1 && "Mostrar datos en tiempo real"}
                    {i === 2 && "Mostrar datos de predicciones"}
                    {i === 3 && "Mostrar datos de alertas"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Actuators Control Cards */}
        <div className="flex flex-col p-5">
          <h3 className="text-lg font-semibold mb-4">Sensores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ControlCard
              id="Iluminacion"
              icon={Lightbulb}
              title="Iluminacion"
              description="Indica la iluminacion"
              initialState={true}
              color="white"
              disabled={isAutoMode}
            />
            <ControlCard
              id="red_led"
              icon={Lightbulb}
              title="LED Rojo"
              description="Indica estado de alerta"
              initialState={true}
              color="red"
              disabled={isAutoMode}
            />
            <ControlCard
              id="yellow_led"
              icon={Lightbulb}
              title="LED Amarillo"
              description="Indica estado de advertencia"
              initialState={true}
              color="yellow"
              disabled={isAutoMode}
            />
            <ControlCard
              id="green_led"
              icon={Lightbulb}
              title="LED Verde"
              description="Indica estado normal"
              initialState={true}
              color="green"
              disabled={isAutoMode}
            />
            <ControlCard
              id="blue_led"
              icon={Lightbulb}
              title="LED Azul"
              description="Indica estado de información"
              initialState={true}
              color="blue"
              disabled={isAutoMode}
            />
            <ControlCard
              id="motor_fan"
              icon={Fan}
              title="Ventilador"
              description="Controla la velocidad del ventilador"
              initialState={true}
              color="cyan"
              disabled={isAutoMode}
            />
            <ControlCard
              id="buzzer"
              icon={AudioLines}
              title="Buzzer"
              description="Emite sonidos de alerta"
              initialState={true}
              color="purple"
              disabled={isAutoMode}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
