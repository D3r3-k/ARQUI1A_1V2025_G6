"use client";
import { useState } from "react";
import TabNavigation, { SensorType } from "../TabNavigation/TabNavigation";
import { Thermometer } from "lucide-react";

export default function HistoricoPage() {
  // Hook's
  // State's
  const [activeTab, setActiveTab] = useState<SensorType>("temperature");
  // Effect's
  // Handler's
  // Render's
  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">Historico</h1>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-3">
        {/* Content */}
        <div className="w-full min-h-5 lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 p-2 bg-red-600 dark:bg-red-900/40 rounded-sm flex items-center justify-center">
                  <Thermometer size={32} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Temperatura
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Tendencia de datos historicos
                  </span>
                </div>
              </div>
              {/* Placeholder for historical data chart or table */}
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Grafico de datos historicos
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-red-500 dark:bg-red-900/40 p-2 rounded-sm items-center">
                <Thermometer size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Valor actual
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="flex gap-2 justify-center items-end">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  25.4
                </span>
                <span className="text-xl font-bold text-gray-400">°C</span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-400">
                06/06/2025 14:34
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-sm shadow border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
              <h3>Datos historicos</h3>
              <span className="text-gray-400 text-sm">
                Ultima actualizacion:{" "}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-800 dark:text-gray-200 text-sm">
                    06/06/2025
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    14:34
                  </span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-semibold">
                  25.4°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-800 dark:text-gray-200 text-sm">
                    06/06/2025
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    14:30
                  </span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-semibold">
                  25.1°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-800 dark:text-gray-200 text-sm">
                    06/06/2025
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    14:26
                  </span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-semibold">
                  24.9°C
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
