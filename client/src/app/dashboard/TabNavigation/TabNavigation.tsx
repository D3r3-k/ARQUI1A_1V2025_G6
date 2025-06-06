"use client";

import { Droplets, Gauge, Sun, Thermometer } from "lucide-react";
export type SensorType = "temperature" | "humidity" | "luminosity" | "pressure";
interface TabNavigationProps {
  activeTab: SensorType;
  onTabChange: (tab: SensorType) => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  const tabConfig = {
    temperature: {
      icon: Thermometer,
      label: "Temperatura",
      color: "border-red-500 text-red-600",
    },
    humidity: {
      icon: Droplets,
      label: "Humedad",
      color: "border-blue-500 text-blue-600",
    },
    luminosity: {
      icon: Sun,
      label: "Luminosidad",
      color: "border-yellow-500 text-yellow-600",
    },
    pressure: {
      icon: Gauge,
      label: "Presión",
      color: "border-green-500 text-green-600",
    },
  };
  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <nav className="flex space-x-8 px-6">
        {(Object.keys(tabConfig) as SensorType[]).map((tab) => {
          const config = tabConfig[tab];
          const Icon = config.icon;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                isActive
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
