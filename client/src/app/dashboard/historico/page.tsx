"use client";

import { useEffect, useState } from "react";
import TabNavigation from "./components/TabNavigation/TabNavigation";
import { ChartLine, Droplets, Gauge, SunMedium, Thermometer } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMqtt } from "@/hooks/useMqtt";
import { SensorType } from "@/types/TypesDashboard";
import { TopicHistory } from "@/types/TypesMqtt";

export default function HistoricoPage() {
  // Hook's
  const { subscribe, messages } = useMqtt();
  // State's
  const [activeTab, setActiveTab] = useState<SensorType>("temperature");
  const [historicData, setHistoricData] = useState<TopicHistory>({
    date_updated: "",
    sensor: activeTab,
    history: [],
  })
  const [graphData, setGraphData] = useState<any[]>([])
  // Effect's
  useEffect(() => {
    subscribe(`history/${activeTab}`);
    console.log(`Subscribed to history/${activeTab}`);
    return () => { }
  }, [activeTab, subscribe]);

  useEffect(() => {
    const historyData = messages[`history/${activeTab}`] as TopicHistory;
    if (historyData) {
      setHistoricData(historyData);
      const transformedData = historyData.history.map((item) => ({
        timestamp: `${item.hour} ${item.date}`,
        [activeTab]: parseFloat(item.value).toFixed(2),
      }));
      setGraphData(transformedData);
    } else {
      setHistoricData({
        date_updated: "",
        sensor: activeTab,
        history: [],
      });
      setGraphData([
        { timestamp: "N/A", [activeTab]: "0" }
      ]);
    }
  }, [messages, activeTab]);

  // Handler's
  // Render's
  const historyOpt = {
    temperature: {
      icon: Thermometer,
      label: "Temperatura",
      unit: "°C",
      color: {
        border: "border-red-500",
        text: "text-red-900 dark:text-red-400",
        bg: "bg-red-400 dark:bg-red-900/40",
      },
    },
    humidity: {
      icon: Droplets,
      label: "Humedad",
      unit: "%",
      color: {
        border: "border-blue-500",
        text: "text-blue-900 dark:text-blue-400",
        bg: "bg-blue-400 dark:bg-blue-900/40",
      },
    },
    luminosity: {
      icon: SunMedium,
      label: "Luminosidad",
      unit: "lux",
      color: {
        border: "border-yellow-500",
        text: "text-yellow-900 dark:text-yellow-400",
        bg: "bg-yellow-400 dark:bg-yellow-700/60",
      },
    },
    pressure: {
      icon: Gauge,
      label: "Presión",
      unit: "hPa",
      color: {
        border: "border-green-500 dark:border-green-700",
        text: "text-green-900 dark:text-green-400",
        bg: "bg-green-400 dark:bg-green-900/60",
      },
    },
  }[activeTab];

  return (
    <main className="flex-1 p-4 lg:p-6 flex flex-col gap-4">
      <div className="gap-6 flex justify-between">
        <h1 className="text-2xl font-bold">Historico</h1>
        {/* <button className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors flex items-center gap-2 p-2 rounded-md
          border border-gray-200 dark:border-gray-700 cursor-pointer`}>
          <span className="text-sm font-semibold">Actualizar</span>
          <RefreshCcw size={20} />
        </button> */}
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-full">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="w-full min-h-5">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-12 h-12 p-2 rounded-sm flex items-center justify-center ${historyOpt.color.bg}`}>
                      <historyOpt.icon size={32} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {historyOpt.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tendencia de datos historicos
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <ChartLine size={24} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-400 ml-2">
                      Últimas {historicData.history.length} lecturas
                    </span>
                  </div>

                </div>
                {/* Grafica */}
                <ResponsiveContainer width={800} height={500} >
                  <AreaChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tick={{ fill: '#6b7280' }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [
                        <span style={{ color: "#ef4444", fontWeight: 'bold' }}>
                          {value}{historyOpt.unit}
                        </span>,
                        historyOpt.label
                      ]}
                      labelStyle={{ color: '#374151', fontWeight: '500' }}
                      cursor={{ stroke: "#ef4444", strokeWidth: 1, strokeOpacity: 0.5 }}
                    />
                    <Area
                      type="linear"
                      dataKey={activeTab}
                      stroke={"#ef4444"}
                      strokeWidth={3}
                      fill={`url(#gradient-${activeTab})`}
                      dot={true}
                      activeDot={{
                        r: 6,
                        fill: '#ef4444',
                        strokeWidth: 3,
                        stroke: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
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
              <div className={`w-10 h-10 p-2 rounded-sm items-center ${historyOpt.color.bg}`}>
                <historyOpt.icon size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Valor actual
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="flex gap-2 justify-center items-end">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {
                    historicData.history.length > 0
                      ? historicData.history[historicData.history.length - 1].value
                      : "N/A"
                  }
                </span>
                <span className="text-xl font-bold text-gray-400">{historyOpt.unit}</span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-400">
                {

                  historicData.history.length > 0
                    ? historicData.history[historicData.history.length - 1].date + " " + historicData.history[historicData.history.length - 1].hour
                    : "No disponible"
                }
              </span>
            </div>
          </div>
          {/* Historico */}
          <div className="bg-white dark:bg-gray-900 rounded-sm shadow border border-gray-200 dark:border-gray-700 max-h-150 flex flex-col gap-3">
            <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 pb-3 shrink-0 p-4">
              <h3>Datos historicos</h3>
              <span className="text-gray-400 text-sm">
                actualizacion: {historicData.date_updated || "N/A"}
              </span>
            </div>
            {/* Contenido historico */}
            <div className="flex flex-col gap-2 flex-1 h-full overflow-y-auto scrollbar-thin px-4">
              {
                historicData.history.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 last:border-0">
                    <div className="flex gap-4 items-center">
                      <span className="w-6 h-6 bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400 rounded-sm text-[0.75em] flex justify-center items-center">
                        #{index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 text-sm">
                          {item.hour}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-sm font-semibold ${historyOpt.color.bg} ${historyOpt.color.text}`}>
                      {item.value} {historyOpt.unit}
                    </span>
                  </div>
                )).reverse()
              }
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
