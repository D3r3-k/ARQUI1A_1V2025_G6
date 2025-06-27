"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { Calculator, Sigma, BarChart2, ArrowDown, ArrowUp, TrendingUp, Divide, Repeat, ListChecks } from "lucide-react";
import { useEffect } from "react";

const options = [
  { title: "Media", icon: Sigma, color: "blue", desc: "Promedio aritmético de los valores", type: "estadistica" },
  { title: "Mediana", icon: BarChart2, color: "green", desc: "Valor central de los datos ordenados", type: "estadistica" },
  { title: "Moda", icon: ListChecks, color: "purple", desc: "Valor que más se repite", type: "estadistica" },
  { title: "Valor Min", icon: ArrowDown, color: "red", desc: "Valor mínimo encontrado", type: "estadistica" },
  { title: "Valor Max", icon: ArrowUp, color: "yellow", desc: "Valor máximo encontrado", type: "estadistica" },
  { title: "Desviación Estándar", icon: TrendingUp, color: "orange", desc: "Medida de dispersión de los datos", type: "estadistica" },
  { title: "Varianza", icon: Divide, color: "zinc", desc: "Medida de variabilidad estadística", type: "estadistica" },
  { title: "Media Movil", icon: Repeat, color: "blue", desc: "Promedio de valores en una ventana deslizante", type: "predicciones" },
  { title: "Suavizado Exponencial", icon: ListChecks, color: "green", desc: "Predicción basada en suavizado exponencial", type: "predicciones" },
];

interface CardCalculateProps {
  id: "media" | "mediana" | "moda" | "minimo" | "maximo" | "desviacion" | "varianza" | "movil" | "suavizado";
  title: "Media" | "Mediana" | "Moda" | "Valor Min" | "Valor Max" | "Desviación Estándar" | "Varianza" | "Media Movil" | "Suavizado Exponencial";
}

export default function CardCalculate({ id, title }: CardCalculateProps) {
  const option = options.find((opt) => opt.title === title);
  if (!option) return null;
  // Hook's
  const { calculateRes } = useMqtt();
  // State's
  // Effect's
  useEffect(() => {
    console.log(calculateRes)
  }, [calculateRes]);
  // Handler's
  // Render's  
  const Icon = option.icon;
  const colorConfig = {
    red: {
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-700/10 dark:bg-red-700/20",
    },
    green: {
      text: "text-green-700 dark:text-green-400",
      bg: "bg-green-700/10 dark:bg-green-700/20",
    },
    blue: {
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-700/10 dark:bg-blue-700/20",
    },
    yellow: {
      text: "text-yellow-700 dark:text-yellow-400",
      bg: "bg-yellow-700/10 dark:bg-yellow-700/20",
    },
    purple: {
      text: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-700/10 dark:bg-purple-700/20",
    },
    orange: {
      text: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-700/10 dark:bg-orange-700/20",
    },
    zinc: {
      text: "text-zinc-700 dark:text-zinc-400",
      bg: "bg-zinc-700/10 dark:bg-zinc-700/20",
    },
  }[option.color] || {
    text: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-500/10 dark:bg-gray-500/20",
  };

  return (
    <div
      className="rounded-lg border border-gray-100 dark:border-zinc-800 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 transition-colors duration-300">
          {title}
        </h3>
        <div className={`rounded-lg p-3 ${colorConfig.bg} transition-colors duration-300`}>
          <Icon size={24} className={`${colorConfig.text} transition-colors duration-300`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-400 transition-colors duration-300 leading-relaxed">
          {option.desc}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 gap-2 flex justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {option.type
              ? option.type === "estadistica"
                ? "Cálculo estadístico"
                : option.type === "predicciones"
                  ? "Cálculo de predicción"
                  : option.type === "completo"
                    ? "Cálculos completos"
                    : option.type
              : "Cálculo"}
          </span>
          <span className="text-xs text-gray-200">
            {
              calculateRes && calculateRes[id] == -1 ? "N/A" : calculateRes[id]
            }
          </span>
        </div>
      </div>
    </div>
  );
}
