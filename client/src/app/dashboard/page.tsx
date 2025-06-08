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
          <DashCard type="sensors" title="Sensores Activos" color="blue" desc="Configurados" />
          <DashCard type="devices" title="Dispositivos en Linea" color="green" desc="Dispositivos conectados" />
          <DashCard type="time" title="Tiempo de ejecucion" color="purple" desc={`Ultima consulta: ${new Date().toLocaleTimeString()}`} />
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
            id="temperature"
            color="red"
            title="Temperatura"
          />
          <AmbientCard
            id="humidity"
            color="blue"
            title="Humedad"
          />
          <AmbientCard
            id="brightness"
            color="yellow"
            title="Luminosidad"
          />
          <AmbientCard
            id="co2"
            color="zinc"
            title="Nivel de CO2"
          />
          <AmbientCard
            id="pressure"
            color="purple"
            title="Presión Atmosférica"
          />
          <AmbientCard
            id="presence"
            color="green"
            title="Presencia Detectada"
          />
        </div>
        {/* Actividad */}
        {/* <div className="mt-2">
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
              <ActivityCard color="green" spanText="Sensor de temperatura" desc="Activado en Invernadero1" />
              <ActivityCard color="red" spanText="Sensor de temperatura" desc="Apagado en Invernadero2" />
              <ActivityCard color="blue" spanText="Sensor de humedad" desc="Configurado" />
              <ActivityCard color="yellow" spanText="Sensor de CO2" desc="con problema de aire" />
            </div>
            <div className="border-t border-gray-100 dark:border-zinc-800 p-2">
              <button className="w-full rounded-md px-3 py-2 text-sm hover:bg-muted">
                Ver historial completo
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </main>
  )
}
