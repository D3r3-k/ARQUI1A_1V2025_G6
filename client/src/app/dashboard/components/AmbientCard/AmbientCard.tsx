import { ForwardRefExoticComponent } from "react";

interface AmbientCardProps {
  Icon: ForwardRefExoticComponent<any>;
  color: "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "zinc";
  title: string;
  status: "Normal" | "Warning" | "Critical";
  value: number | string;
  unit: string;
  minValue: number | string;
  maxValue: number | string;
  lastUpdate: string;
  progress: number;
}

export default function AmbientCard({
  Icon,
  color,
  title,
  status,
  value,
  unit,
  minValue,
  maxValue,
  lastUpdate,
  progress,
}: AmbientCardProps) {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  const colorCard = {
    red: {
      text: "text-red-500 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/40",
      bgBar: "bg-red-500",
    },
    green: {
      text: "text-green-500 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/40",
      bgBar: "bg-green-500",
    },
    blue: {
      text: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/40",
      bgBar: "bg-blue-500",
    },
    yellow: {
      text: "text-yellow-500 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/40",
      bgBar: "bg-yellow-500",      
    },
    purple: {
      text: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/40",
      bgBar: "bg-purple-500",      
    },
    orange: {
      text: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/40",
      bgBar: "bg-orange-500",      
    },
    zinc: {
      text: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-900/40",
      bgBar: "bg-zinc-500",
    },
  }[color] || {
    text: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-900/40",
    bgBar: "bg-gray-500",
  };
  return (
    <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center gap-4">
      <div className={`rounded-lg p-3 ${colorCard.bg} transition-colors duration-300`}>
        <Icon size={24} className={`${colorCard.text} transition-colors duration-300`} />
      </div>
      <div className="flex flex-1 items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 transition-colors duration-300">{title}</h3>
        <span className={"rounded-md px-2 py-1 text-xs font-medium bg-green-600/20 text-green-700 dark:bg-green-700/20 dark:text-green-400 transition-colors duration-300"}>
        {status}
        </span>
      </div>
      </div>
      <div className="mt-3">
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold transition-colors duration-300">{value}</p>
        <span className="text-sm text-gray-400 transition-colors duration-300">{unit}</span>
      </div>
      </div>
      <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-gray-400 transition-colors duration-300">
        <span>{minValue}{unit}</span>
        <span>{maxValue}{unit}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-500 rounded-full overflow-hidden transition-colors duration-300">
        <div
        className={`h-full rounded-full ${colorCard.bgBar} transition-all duration-500`}
        style={{ width: progress + "%" }}
        />
      </div>
      <p className="text-xs text-gray-400 transition-colors duration-300">
        Última actualización: {lastUpdate}
      </p>
      </div>
    </div>
  )
}
