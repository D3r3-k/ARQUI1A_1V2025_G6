"use client";

import { Droplets, Thermometer, Wind, Gauge, Lightbulb } from "lucide-react";
import CardCalculate from "../components/CardCalculate/CardCalculate";
import SensorCard from "../components/SensorCard/SensorCard";

const sensors = [
  { id: "humedad", name: "Humedad", icon: Droplets, color: "blue" },
  { id: "temperatura", name: "Temperatura", icon: Thermometer, color: "red" },
  { id: "presion", name: "Presión", icon: Wind, color: "purple" },
  { id: "calidad_aire", name: "Calidad del Aire", icon: Gauge, color: "yellow" },
  { id: "luminosidad", name: "Luminosidad", icon: Lightbulb, color: "orange" },
];

export default function page() {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Cálculos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Seleccione un sensor y una operación para calcular.
          </p>
        </div>
      </div>

      {/* Selector de sensores */}
      <div className="mt-6">
        <div className="grid grid-cols-5 gap-3">
          <SensorCard
            key="humedad"
            id="humedad"
            name="Humedad"
            icon={Droplets}
            color="blue"
          />
          <SensorCard
            key="temperatura"
            id="temperatura"
            name="Temperatura"
            icon={Thermometer}
            color="red"
          />
          <SensorCard
            key="presion"
            id="presion"
            name="Presión"
            icon={Wind}
            color="purple"
          />
          <SensorCard
            key="calidad_aire"
            id="calidad_aire"
            name="Calidad del Aire"
            icon={Gauge}
            color="yellow"
          />
          <SensorCard
            key="luminosidad"
            id="luminosidad"
            name="Luminosidad"
            icon={Lightbulb}
            color="orange"
          />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Calculos Estadísticos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 items-center">
          <CardCalculate id="media" title="Media" />
          <CardCalculate id="mediana" title="Mediana" />
          <CardCalculate id="moda" title="Moda" />
          <CardCalculate id="minimo" title="Valor Min" />
          <CardCalculate id="maximo" title="Valor Max" />
          <CardCalculate id="desviacion" title="Desviación Estándar" />
          <CardCalculate id="varianza" title="Varianza" />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Calculos de Predicciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-center">
          <CardCalculate id="suavizado" title="Suavizado Exponencial" />
          <CardCalculate id="movil" title="Media Movil" />
        </div>
      </div>
    </main>
  )
}
