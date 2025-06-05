import { Clock, Power } from "lucide-react";

export default function ActivityCard() {
  return (
    <div className="flex items-start gap-4 p-4">
      <div className="mt-0.5">
        <Power size={16} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">Admin</span>{" "}
          Activo{" "}
          <span className="font-medium">Sensor</span>
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          hace 5 minutos
        </p>
      </div>
    </div>
  )
}
