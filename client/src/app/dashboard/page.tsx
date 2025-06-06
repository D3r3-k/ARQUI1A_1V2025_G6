import { Activity, Droplets, Gauge, Lightbulb, Power, Settings, Thermometer, User, Wind } from "lucide-react";
import ActivityCard from "./components/ActivityCard/ActivityCard";
import DashCard from "./components/DashCard/DashCard";
import AmbientCard from "./components/AmbientCard/AmbientCard";

export default function DashboardPage() {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {/* Tarjeta de resumen */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashCard type="sensors" title="Sensores Activos" color="blue" desc="Sensores configurados" />
          <DashCard type="devices" title="Dispositivos en Linea" color="green" desc="dispositivos conectados" />
          <DashCard type="time" title="Tiempo de ejecucion" color="purple" desc="ultimo reinicio: 06/04/2025" />
          <DashCard
            type="localTime"
            title="Hora local"
            color="orange"
            desc={`Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}
          />
        </div>
        {/* Datos de sensores */}
        <h2 className="text-xl font-semibold tracking-tight mt-2">Datos Ambientales</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AmbientCard
            Icon={Thermometer}
            color="red"
            title="Temperatura"
            status="Normal"
            value={24.5}
            unit="°C"
            minValue={18}
            maxValue={55}
            progress={50}
            lastUpdate={"Hace 10 minutos"} />
          <AmbientCard
            Icon={Droplets}
            color="blue"
            title="Humedad"
            status="Normal"
            value={48}
            unit="%"
            minValue={30}
            maxValue={80}
            progress={60}
            lastUpdate={"Hace 2 minutos"} />
          <AmbientCard
            Icon={Lightbulb}
            color="yellow"
            title="Luminosidad"
            status="Normal"
            value={850}
            unit="lux"
            minValue={200}
            maxValue={1000}
            progress={75}
            lastUpdate={"Hace 3 minutos"} />
          <AmbientCard
            Icon={Wind}
            color="zinc"
            title="Nivel de CO2"
            status="Warning"
            value={620}
            unit="ppm"
            minValue={400}
            maxValue={1000}
            progress={35}
            lastUpdate={"Hace 7 minutos"} />
          <AmbientCard
            Icon={Gauge}
            color="purple"
            title="Presión Atmosférica"
            status="Critical"
            value={1013}
            unit="hPa"
            minValue={950}
            maxValue={1050}
            progress={80}
            lastUpdate={"Hace 4 minutos"} />
          <AmbientCard
            Icon={User}
            color="green"
            title="Presencia Detectada"
            status="Normal"
            value={"Si"}
            unit=""
            minValue={"No"}
            maxValue={"Si"}
            progress={100}
            lastUpdate={"Hace 1 minutos"} />
        </div>
        {/* Actividad */}
        <div className="mt-2">
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="border-b border-gray-100 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Activity size={16} />
                  Actividad Reciente
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
              <ActivityCard IconActivity={Power} color="green" spanText="Sensor de temperatura" desc="Activado en Invernadero1" />
              <ActivityCard IconActivity={Power} color="red" spanText="Sensor de temperatura" desc="Apagado en Invernadero2" />
              <ActivityCard IconActivity={Settings} color="blue" spanText="Sensor de humedad" desc="Configurado" />
              <ActivityCard IconActivity={Settings} color="yellow" spanText="Sensor de CO2" desc="con problema de aire" />
            </div>
            <div className="border-t border-gray-100 dark:border-zinc-800 p-2">
              <button className="w-full rounded-md px-3 py-2 text-sm hover:bg-muted">
                Ver historial completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
