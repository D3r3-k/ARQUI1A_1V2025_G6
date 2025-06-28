"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { TopicDashboard } from "@/types/TypesMqtt";
import { Clock, Cpu, Fan, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardPageProps {
  title: string;
  color: string;
  desc: string;
  type: "sensors" | "devices" | "time" | "localTime";
}

const TOPIC_MAP: Record<string, string> = {
  sensors: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/sensors`,
  devices: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/devices`,
  time: `${process.env.NEXT_PUBLIC_TOPICS_LINK}/time`,
  localTime: "localTime", // This is a custom value, not an MQTT topic
}

export default function DashCard({
  title,
  color,
  desc,
  type,
}: DashboardPageProps) {
  // Hook's
  const { infoTopics } = useMqtt();
  const [mounted, setMounted] = useState(false);
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    setMounted(true);
    switch (type) {
      case "localTime":
        setLocalTime(new Date().toLocaleTimeString());
        const interval = setInterval(() => {
          setLocalTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);

      default:
        break;
    }
  }, [type]);

  // Data según el tipo de tarjeta
  const valueData = (() => {
    switch (type) {
      case "localTime":
        return mounted ? localTime : "";
      case "sensors":
        return "5";
      case "devices": {
        const topic = TOPIC_MAP[type];
        const data = infoTopics[topic] as TopicDashboard;
        return data?.value !== undefined ? String(data.value) : "N/A";
      }
      case "time": {
        const topic = TOPIC_MAP[type];
        const data = infoTopics[topic] as TopicDashboard;
        if (data?.value !== undefined) {
          const uptimeInSeconds = parseInt(String(data.value), 10);
          if (!isNaN(uptimeInSeconds)) {
            const hours = Math.floor(uptimeInSeconds / 3600);
            const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
            const seconds = uptimeInSeconds % 60;
            return `${hours}h ${minutes}m ${seconds}s`;
          }
        }
        return "N/A";
      }
      default:
        return "N/A";
    }
  })();

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
    },
  }[color] || {
    text: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-500/10 dark:bg-gray-500/20",
  };
  const Icon = {
    sensors: Cpu,
    devices: Fan,
    time: Timer,
    localTime: Clock,
  }[type];

  return (
    <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`rounded-lg p-3 ${iconColor?.bg}`}>
          <Icon size={24} className={iconColor?.text} />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">
          {type === "localTime" && !mounted ? "" : valueData}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {desc}
        </p>
      </div>
    </div>
  );
}
