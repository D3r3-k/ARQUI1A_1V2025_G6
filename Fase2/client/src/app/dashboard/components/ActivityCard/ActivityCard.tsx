"use client";

import { Clock, Cpu } from "lucide-react";

interface ActivityCardProps {
  spanText?: string;
  desc?: string;
  time?: string;
  color: "green" | "red" | "yellow" | "blue";
}

export default function ActivityCard({
  spanText,
  desc,
  color,
}: ActivityCardProps) {
  // Hook's
  // const { subscribe, messages } = useMqtt();
  // State's
  // Effect's
  // Handler's
  // Render's
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
  };
  return (
    <div className="flex items-start gap-4 p-4 cursor-pointer">
      <div className="flex items-start gap-4 transition-transform duration-300 ease-in-out transform hover:translate-x-2">
        <div className="mt-0.5">
          <Cpu size={16} className={`${colors[color]}`} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-medium">{spanText} </span>
            <span>{desc}</span>
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            hace 5 minutos
          </p>
        </div>
      </div>
    </div>
  );
}
