"use client";

import { SensorType } from "@/types/TypesDashboard";
import { Droplets, Gauge, Sun, Thermometer, Wind } from "lucide-react";
interface TabNavigationProps {
  activeTab: SensorType;
  onTabChange: (tab: SensorType) => void;
  className?: string;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  className = "",
}: TabNavigationProps) {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  const tabConfig = {
    temperatura: {
      icon: Thermometer,
      label: "Temperatura",
      color: "border-red-500 text-red-600 dark:text-red-500",
    },
    humedad: {
      icon: Droplets,
      label: "Humedad",
      color: "border-blue-500 text-blue-600 dark:text-blue-400",
    },
    luminosidad: {
      icon: Sun,
      label: "Luminosidad",
      color: "border-yellow-500 text-yellow-600 dark:text-yellow-500",
    },
    presion: {
      icon: Gauge,
      label: "Presión",
      color: "border-green-500 text-green-600 dark:text-green-500",
    },
    calidad_aire: {
      icon: Wind,
      label: "Calidad del Aire",
      color: "border-purple-500 text-purple-600 dark:text-purple-500",
    },
  };
  return (
    <section className={`bg-white dark:bg-gray-900 rounded-sm shadow border border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="flex space-x-8 px-6">
        {(Object.keys(tabConfig) as SensorType[]).map((tab) => {
          const config = tabConfig[tab];
          const Icon = config.icon;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${isActive
                ? `${config.color} border-opacity-100`
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
