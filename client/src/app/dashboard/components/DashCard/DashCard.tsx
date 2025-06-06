"use client";

import { Clock, Cpu, Timer, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardPageProps {
  title: string;
  color: string;
  desc: string;
  type: "sensors" | "devices" | "time" | "localTime";
}

export default function DashCard({ title, color, desc, type }: DashboardPageProps) {
  // Hook's
  // State's
  const [valueData, setValueData] = useState<string>("")
  // Effect's
  useEffect(() => {
    const fetchData = async () => {
      switch (type) {
        case "sensors":
          setValueData("12");
          break;
        case "devices":
          setValueData("8");
          break;
        case "time":
          setValueData("3 days");
          break;
        case "localTime":
          setValueData(new Date().toLocaleTimeString());
          break;
        default:
          setValueData("N/A");
      }
    };
    fetchData();
    return () => {
      // Cleanup if necessary
      setValueData("");
    };
  }, []);

  //actualizar el valor de valueData cada segundo
  useEffect(() => {
    if (type === "localTime") {
      const interval = setInterval(() => {
        setValueData(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type]);

  // Handler's
  // Render's
  const iconColor = {
    green: {
      text: "text-green-700 dark:text-green-400",
      bg: "bg-green-700/20 dark:bg-green-700/20",
    },
    red: {
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-700/20 dark:bg-red-700/20",
    },
    blue: {
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-700/10 dark:bg-blue-700/20",
    },
    yellow: {
      text: "text-yellow-700 dark:text-yellow-400",
      bg: "bg-yellow-700/10 dark:bg-yellow-700/20",
    },
    purple: {
      text: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-700/10 dark:bg-purple-700/20",
    },
    orange: {
      text: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-700/10 dark:bg-orange-700/20",
    }
  }[color] || {
    text: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-500/10 dark:bg-gray-500/20",
  }
  const Icon = {
    sensors: Cpu,
    devices: Wifi,
    time: Timer,
    localTime: Clock
  }[type]
  return (
    <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`rounded-lg p-3 ${iconColor?.bg}`}>
          <Icon size={24} className={iconColor?.text} />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{valueData}</p>
        <p className="mt-1 text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  )
}
