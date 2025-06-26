"use client";

import { useEffect, useState } from "react";
import { SunSnow, ChartSpline, AlertTriangle } from "lucide-react";
import { useMqtt } from "@/hooks/useMqtt";

const options = [
    {
        id: "sensores",
        title: "Tiempo real",
        description: "Mostrar datos en tiempo real",
        icon: <SunSnow size={16} />,
    },
    {
        id: "predicciones",
        title: "Predicciones",
        description: "Mostrar datos de predicciones",
        icon: <ChartSpline size={16} />,
    },
    {
        id: "alertas",
        title: "Alertas",
        description: "Mostrar datos de alertas",
        icon: <AlertTriangle size={16} />,
    },
];

const topic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/pantalla`;

export default function LCDSelector() {
    // Hooks
    const { publish } = useMqtt();
    // States
    const [selected, setSelected] = useState<"sensores" | "predicciones" | "alertas">("sensores");
    // Effects
    // Cargar estado inicial desde localStorage (si existe)
    useEffect(() => {
        const storedSelected = localStorage.getItem("lcdSelected");
        if (storedSelected) {
            setSelected(JSON.parse(storedSelected));
        }
    }, []);
    // Guardar estado en localStorage al cambiar
    useEffect(() => {
        localStorage.setItem("lcdSelected", JSON.stringify(selected));
    }, [selected]);

    // Handlers
    const handleToggle = (id: "sensores" | "predicciones" | "alertas") => {
        setSelected(id);
        publish(topic, JSON.stringify({ selected: id }));
    };
    // Functions
    // Renders

    return (
        <div className="p-5 bg-white dark:bg-gray-900 flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Visualización LCD</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.map((option) => {
                    const isActive = option.id === selected;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleToggle(option.id as "sensores" | "predicciones" | "alertas")}
                            className={`flex items-center space-x-3 rounded-md p-3 border cursor-pointer transition-all ${isActive
                                ? "border-cyan-600 bg-cyan-600/20 dark:bg-cyan-600/30"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                }`}
                        >
                            <div
                                className={`rounded-md p-2 ${isActive
                                    ? "bg-cyan-600/40 dark:bg-cyan-600/30 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                    }`}
                            >
                                {option.icon}
                            </div>
                            <div className="flex-grow">
                                <div className="text-sm font-medium">{option.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {option.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
