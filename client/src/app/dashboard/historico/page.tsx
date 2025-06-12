"use client";

import { useState } from "react";
import TabNavigation from "./components/TabNavigation/TabNavigation";
import {
  ChartLine,
  Droplets,
  Gauge,
  LucideIcon,
  SunMedium,
  Thermometer,
  Wind,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMqtt } from "@/hooks/useMqtt";
import { SensorType } from "@/types/TypesDashboard";

// Mapeo de sensor y topic stackeable
const sensorTopicMap: Record<SensorType, { topic: string; label: string; unit: string; icon: LucideIcon; color: { border: string; text: string; bg: string } }> = {
  temperatura: {
    topic: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/temperatura`,
    label: "Temperatura",
    unit: "°C",
    icon: Thermometer,
    color: {
      border: "border-red-500",
      text: "text-red-900 dark:text-red-400",
      bg: "bg-red-400 dark:bg-red-900/40",
    },
  },
  humedad: {
    topic: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/humedad`,
    label: "Humedad",
    unit: "%",
    icon: Droplets,
    color: {
      border: "border-blue-500",
      text: "text-blue-900 dark:text-blue-400",
      bg: "bg-blue-400 dark:bg-blue-900/40",
    },
  },
  luminosidad: {
    topic: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/luz`,
    label: "Luminosidad",
    unit: "lux",
    icon: SunMedium,
    color: {
      border: "border-yellow-500",
      text: "text-yellow-900 dark:text-yellow-400",
      bg: "bg-yellow-400 dark:bg-yellow-700/60",
    },
  },
  presion: {
    topic: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/presion`,
    label: "Presión",
    unit: "hPa",
    icon: Gauge,
    color: {
      border: "border-green-500 dark:border-green-700",
      text: "text-green-900 dark:text-green-400",
      bg: "bg-green-400 dark:bg-green-900/60",
    },
  },
  calidad_aire: {
    topic: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/calidad_aire`,
    label: "Calidad del aire",
    unit: "AQI",
    icon: Wind,
    color: {
      border: "border-purple-500 dark:border-purple-700",
      text: "text-purple-900 dark:text-purple-400",
      bg: "bg-purple-400 dark:bg-purple-900/60",
    },
  },
};

export default function HistoricoPage() {
  const { stackTopics } = useMqtt();
  const [activeTab, setActiveTab] = useState<SensorType>("temperatura");

  // Topic y datos según tab activa
  const sensorOpt = sensorTopicMap[activeTab];
  const stack = stackTopics[sensorOpt.topic]?.history ?? [];

  // Preparar datos para la gráfica (siempre orden ascendente por timestamp)
  const graphData = stack.map((item) => ({
    timestamp: new Date(Number(item.timestamp)).toLocaleTimeString(),
    value: parseFloat(item.value),
  }));

  // Último dato (si hay datos)
  const latestItem = stack.length > 0 ? stack[stack.length - 1] : undefined;

  return (
    <main className="flex-1 p-4 lg:p-6 flex flex-col gap-4">
      <div className="gap-6 flex justify-between">
        <h1 className="text-2xl font-bold">Histórico</h1>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main chart section */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-full">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="w-full min-h-5">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-12 h-12 p-2 rounded-sm flex items-center justify-center ${sensorOpt.color.bg}`}>
                      <sensorOpt.icon size={32} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {sensorOpt.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tendencia de datos históricos
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <ChartLine
                      size={24}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-400 ml-2">
                      Últimas {stack.length} lecturas
                    </span>
                  </div>
                </div>
                {/* Gráfica */}
                <ResponsiveContainer width={"100%"} height={500}>
                  <AreaChart
                    data={graphData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={"#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={"#ef4444"} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tick={{ fill: "#6b7280" }}
                      domain={["dataMin - 1", "dataMax + 1"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value: number, index: number) => [
                        <span key={index} style={{ color: "#ef4444", fontWeight: 'bold' }}>
                          {value}{sensorOpt.unit}
                        </span>,
                        sensorOpt.label
                      ]}
                      labelStyle={{ color: '#374151', fontWeight: '500' }}
                      cursor={{ stroke: "#ef4444", strokeWidth: 1, strokeOpacity: 0.5 }}
                    />
                    <Area
                      type="linear"
                      dataKey="value"
                      stroke={"#ef4444"}
                      strokeWidth={3}
                      fill={`url(#gradient-${activeTab})`}
                      dot={true}
                      activeDot={{
                        r: 6,
                        fill: "#ef4444",
                        strokeWidth: 3,
                        stroke: "white",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <aside className="flex-1 flex flex-col gap-4 col-span-1 lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 p-2 rounded-sm items-center ${sensorOpt.color.bg}`}>
                <sensorOpt.icon size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Valor actual
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="flex gap-2 justify-center items-end">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {latestItem ? latestItem.value : "N/A"}
                </span>
                <span className="text-xl font-bold text-gray-400">
                  {sensorOpt.unit}
                </span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-400">
                {latestItem
                  ? new Date(Number(latestItem.timestamp)).toLocaleString()
                  : "No disponible"}
              </span>
            </div>
          </div>
          {/* Histórico (listado) */}
          <div className="bg-white dark:bg-gray-900 rounded-sm shadow border border-gray-200 dark:border-gray-700 max-h-150 flex flex-col gap-3">
            <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 pb-3 shrink-0 p-4">
              <h3>Datos históricos</h3>
              <span className="text-gray-400 text-sm">
                actualizacion: {latestItem ? new Date(Number(latestItem.timestamp)).toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1 h-full overflow-y-auto scrollbar-thin px-4">
              {stack
                .slice() // copia para no mutar
                .reverse() // para mostrar el más reciente arriba
                .map((item, index) => (
                  <div
                    key={item.timestamp + index}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 last:border-0"
                  >
                    <div className="flex gap-4 items-center">
                      <span className="w-6 h-6 bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400 rounded-sm text-[0.75em] flex justify-center items-center">
                        #{stack.length - index}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 text-sm">
                          {new Date(Number(item.timestamp)).toLocaleTimeString()}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          {new Date(Number(item.timestamp)).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-sm font-semibold ${sensorOpt.color.bg} ${sensorOpt.color.text}`}
                    >
                      {item.value} {sensorOpt.unit}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
