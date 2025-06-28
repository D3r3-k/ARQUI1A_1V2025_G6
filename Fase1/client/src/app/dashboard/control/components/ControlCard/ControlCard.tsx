"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { TopicControl } from "@/types/TypesMqtt";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ControlCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  initialState: boolean;
  isLocked?: boolean;
  color:
    | "blue"
    | "red"
    | "green"
    | "yellow"
    | "purple"
    | "gray"
    | "white"
    | "slate"
    | "cyan";
  disabled: boolean;
}

const topic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/comandos`;
const STORAGE_KEY = "controlConfig";

export default function ControlCard({
  id,
  icon: Icon,
  title,
  description,
  initialState,
  isLocked = false,
  color,
  disabled = false,
}: ControlCardProps) {
  // Hook's
  const { publish } = useMqtt();
  // State's
  const [isOn, setIsOn] = useState<boolean>(initialState);

  // Cargar estado inicial desde localStorage (si existe)
  useEffect(() => {
    try {
      const configRaw = localStorage.getItem(STORAGE_KEY);
      if (configRaw) {
        const config = JSON.parse(configRaw);
        if (config[id] && typeof config[id].action === "boolean") {
          setIsOn(config[id].action);
        }
      }
    } catch (e) {
      console.warn("Error cargando config de control", e);
    }
  }, [id]);

  useEffect(() => {
    setIsOn(disabled ? true: initialState );

    return () => {
      setIsOn(initialState);
    };
  }, [disabled]);

  // Handler
  const handleToggle = () => {
    if (disabled) return;
    const newState = !isOn;
    setIsOn(newState);

    // Construir nuevo objeto para este actuador
    const newControlData: TopicControl = { actuador: id, action: newState };

    // Leer, actualizar y guardar el objeto global de configuración
    let config: Record<string, TopicControl> = {};
    try {
      const configRaw = localStorage.getItem(STORAGE_KEY);
      if (configRaw) {
        config = JSON.parse(configRaw);
      }
    } catch {
      /* ignore */
    }

    config[id] = newControlData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn("Error guardando config de control", e);
    }

    // Publicar por MQTT
    publish(topic, JSON.stringify(newControlData));
  };

  // Render's
  const colorClass = {
    blue: {
      bg: "bg-blue-600/20 dark:bg-blue-600/30",
      text: "text-blue-600 dark:text-blue-400",
      bgSwitch:
        "bg-blue-600 border-blue-600 dark:border-blue-900 dark:bg-blue-900",
    },
    red: {
      bg: "bg-red-600/20 dark:bg-red-600/30",
      text: "text-red-600 dark:text-red-400",
      bgSwitch: "bg-red-600 border-red-600 dark:border-red-900 dark:bg-red-900",
    },
    green: {
      bg: "bg-green-600/20 dark:bg-green-600/30",
      text: "text-green-600 dark:text-green-400",
      bgSwitch:
        "bg-green-600 border-green-600 dark:border-green-900 dark:bg-green-900",
    },
    yellow: {
      bg: "bg-yellow-600/20 dark:bg-yellow-600/30",
      text: "text-yellow-600 dark:text-yellow-400",
      bgSwitch:
        "bg-yellow-600 border-yellow-600 dark:border-yellow-900 dark:bg-yellow-900",
    },
    purple: {
      bg: "bg-purple-600/20 dark:bg-purple-600/30",
      text: "text-purple-600 dark:text-purple-400",
      bgSwitch:
        "bg-purple-600 border-purple-600 dark:border-purple-900 dark:bg-purple-900",
    },
    gray: {
      bg: "bg-gray-600/20 dark:bg-gray-600/30",
      text: "text-gray-600 dark:text-gray-400",
      bgSwitch:
        "bg-gray-600 border-gray-600 dark:border-gray-900 dark:bg-gray-900",
    },
    white: {
      bg: "bg-gray-100 dark:bg-white/30",
      text: "text-gray-900 dark:text-gray-100",
      bgSwitch:
        "bg-gray-500 border-gray-500 dark:border-gray-400 dark:bg-gray-400",
    },
    slate: {
      bg: "bg-slate-600/20 dark:bg-slate-600/30",
      text: "text-slate-600 dark:text-slate-400",
      bgSwitch:
        "bg-slate-600 border-slate-600 dark:border-slate-900 dark:bg-slate-900",
    },
    cyan: {
      bg: "bg-cyan-600/20 dark:bg-cyan-600/30",
      text: "text-cyan-600 dark:text-cyan-400",
      bgSwitch:
        "bg-cyan-600 border-cyan-600 dark:border-cyan-900 dark:bg-cyan-900",
    },
  }[color];
  return (
    <div
      className={`h-fit min-h-[150px] bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 transition-all border border-gray-200 dark:border-gray-700 hover:shadow-md
                ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colorClass.bg}`}>
            <Icon size={24} className={`${colorClass.text}`} />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={disabled}
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out ${
            disabled ? "cursor-not-allowed" : ""
          } ${
            isOn
              ? colorClass.bgSwitch
              : "bg-gray-200 border-gray-200 dark:bg-gray-700 dark:border-gray-700"
          }`}
          aria-pressed={isOn}
          aria-label={`Toggle ${title}`}
        >
          <span className="sr-only">{`Toggle ${title}`}</span>
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isOn ? "translate-x-5 scale-100" : "translate-x-0 scale-100"
            }`}
          ></span>
        </button>
      </div>
      <div className="text-sm">
        <span className="text-gray-500 dark:text-gray-400">Estado: </span>
        <span
          className={`font-medium ${
            isOn
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isOn ? "Activado" : "Desactivado"}
        </span>
        {isLocked && (
          <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
            (Bloqueado)
          </span>
        )}
      </div>
    </div>
  );
}
