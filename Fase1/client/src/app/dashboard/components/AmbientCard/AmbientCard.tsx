"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { TopicAmbient } from "@/types/TypesMqtt";
import {
  Droplets,
  Gauge,
  Lightbulb,
  LucideIcon,
  Thermometer,
  User,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AmbientCardProps {
  id: string;
  color: "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "zinc";
  title: string;
}

export default function AmbientCard({ id, color, title }: AmbientCardProps) {
  // Hook's
  const { ambientTopics } = useMqtt();
  // State's
  const [timestampLabel, setTimestampLabel] = useState<string>("N/A");
  // Option's
  const topic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/${id}`;
  const data: TopicAmbient | undefined = ambientTopics[topic];
  // Effect's
  useEffect(() => {
    if (!data?.timestamp) return setTimestampLabel("N/A");
    const updateLabel = () => {
      const currentTime = Date.now();
      const oldtime = Number(data.timestamp);
      const minutesAgo = Math.floor((currentTime - oldtime) / 60000);
      setTimestampLabel(
        `Hace ${minutesAgo} minuto${minutesAgo !== 1 ? "s" : ""}`
      );
    };
    updateLabel();
    const interval = setInterval(updateLabel, 60000);
    return () => {
      clearInterval(interval)
    };
  }, [data?.timestamp]);

  // Render's
  const colorCard = {
    red: {
      text: "text-red-500 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/40",
      bgBar: "bg-red-500",
    },
    green: {
      text: "text-green-500 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/40",
      bgBar: "bg-green-500",
    },
    blue: {
      text: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/40",
      bgBar: "bg-blue-500",
    },
    yellow: {
      text: "text-yellow-500 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/40",
      bgBar: "bg-yellow-500",
    },
    purple: {
      text: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/40",
      bgBar: "bg-purple-500",
    },
    orange: {
      text: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/40",
      bgBar: "bg-orange-500",
    },
    zinc: {
      text: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-900/40",
      bgBar: "bg-zinc-500",
    },
  }[color] || {
    text: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-900/40",
    bgBar: "bg-gray-500",
  };

  const IconType: LucideIcon = {
    temperatura: Thermometer,
    humedad: Droplets,
    luz: Lightbulb,
    calidad_aire: Gauge,
    presion: Wind,
    distancia: User,
  }[id] || Lightbulb;

  const safeData = {
    status: data?.status ?? "inactive",
    value: data?.value ?? "N/A",
    min: data?.min ?? "N/A",
    max: data?.max ?? "N/A",
    timestamp: data?.timestamp ?? "N/A",
    unit: data?.unit ?? "N/A",
  };

  return (
    <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-lg p-3 ${colorCard.bg} transition-colors duration-300`}
        >
          <IconType
            size={24}
            className={`${colorCard.text} transition-colors duration-300`}
          />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 transition-colors duration-300">
            {title}
          </h3>
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors duration-300 ${safeData.status === "normal"
              ? "bg-green-600/20 text-green-700 dark:bg-green-700/20 dark:text-green-400"
              : safeData.status === "warning"
                ? "bg-yellow-600/20 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400"
                : safeData.status === "critical"
                  ? "bg-red-600/20 text-red-700 dark:bg-red-700/20 dark:text-red-400"
                  : "bg-gray-600/20 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400"
              }`}
          >
            {safeData.status}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold transition-colors duration-300">
            {typeof safeData.value === "boolean"
              ? safeData.value
                ? "Sí"
                : "No"
              : safeData.value}
          </p>
          <span className="text-sm text-gray-400 transition-colors duration-300">
            {safeData.unit}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-400 transition-colors duration-300">
          <span>
            {safeData.min} {safeData.unit}
          </span>
          <span>
            {safeData.max} {safeData.unit}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-500 rounded-full overflow-hidden transition-colors duration-300">
          <div
            className={`h-full rounded-full ${colorCard.bgBar} transition-all duration-500`}
            style={{
              width: (() => {
                const value = safeData.value;
                const min = parseFloat(safeData.min);
                const max = parseFloat(safeData.max);
                if (typeof value === "boolean") {
                  return value ? "100%" : "0%";
                }
                const numValue = parseFloat(value as string);
                if (
                  !isNaN(numValue) &&
                  !isNaN(min) &&
                  !isNaN(max) &&
                  max !== min
                ) {
                  const progress = ((numValue - min) / (max - min)) * 100;
                  return `${Math.max(0, Math.min(100, progress))}%`;
                }
                return "0%";
              })(),
            }}
          />
        </div>
        <p className="text-xs text-gray-400 transition-colors duration-300">
          Última actualización: {timestampLabel}
        </p>
      </div>
    </div>
  );
}
