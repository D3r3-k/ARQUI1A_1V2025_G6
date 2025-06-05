import { Activity } from "lucide-react";
import ActivityCard from "./components/ActivityCard/ActivityCard";

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
      </div>
      {/* Actividad */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-card shadow-sm">
        <div className="border-b border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Activity size={16} />
              Actividad Reciente
            </h3>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-800">
          <ActivityCard />
          <ActivityCard />
          <ActivityCard />
          <ActivityCard />
          <ActivityCard />
        </div>
        <div className="border-t border-gray-200 dark:border-zinc-800 p-2">
          <button className="w-full rounded-md px-3 py-2 text-sm hover:bg-muted">
            Ver historial completo
          </button>
        </div>
      </div>
    </main>
  )
}
