"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";

interface SensorCardProps {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
}

export default function SensorCard({
    id,
    name,
    icon: Icon,
    color
}: SensorCardProps) {
    const { publish, } = useMqtt();
    const colorConfig = {
        red: {
            text: "text-red-600 dark:text-red-500",
            bg: "bg-red-700/10 dark:bg-red-700/20",
            border: "border-gray-200 dark:border-zinc-700",
        },
        blue: {
            text: "text-blue-600 dark:text-blue-500",
            bg: "bg-blue-700/10 dark:bg-blue-700/20",
            border: "border-gray-200 dark:border-zinc-700",
        },
        purple: {
            text: "text-purple-600 dark:text-purple-500",
            bg: "bg-purple-700/10 dark:bg-purple-700/20",
            border: "border-gray-200 dark:border-zinc-700",
        },
        yellow: {
            text: "text-yellow-600 dark:text-yellow-500",
            bg: "bg-yellow-700/10 dark:bg-yellow-700/20",
            border: "border-gray-200 dark:border-zinc-700",
        },
        orange: {
            text: "text-orange-600 dark:text-orange-500",
            bg: "bg-orange-700/10 dark:bg-orange-700/20",
            border: "border-gray-200 dark:border-zinc-700",
        },
    }[color] || {
        text: "text-gray-600 dark:text-gray-500",
        bg: "bg-gray-700/10 dark:bg-gray-700/20",
        border: "border-gray-200 dark:border-zinc-700",
    };
    const topic = `${process.env.NEXT_PUBLIC_TOPICS_LINK}/estadistica`;
    const handleClick = () => {
        publish(topic, JSON.stringify({ sensor: id }));
        toast.info(`Solicitando resultados del sensor: ${name}`, {
            position: "top-right",
        });
    }

    return (
        <button
            onClick={handleClick}
            className={`
        relative p-4 rounded-lg border-2 transition-all duration-300 
        hover:scale-[1.02] hover:shadow-md
        cursor-pointer
        ${colorConfig.border}
      `}
        >
            <div className={`rounded-lg p-3 ${colorConfig.bg} transition-colors duration-300 mb-2`}>
                <Icon size={24} className={`${colorConfig.text} transition-colors duration-300 mx-auto`} />
            </div>
            <p className={`text-sm font-medium transition-colors duration-300 text-gray-800 dark:text-gray-200`}>
                {name}
            </p>
        </button>
    );
}
