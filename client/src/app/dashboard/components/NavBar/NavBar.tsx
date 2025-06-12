"use client";

import { useMqtt } from '@/hooks/useMqtt';
import { Bell, ChevronDown, Dot, User } from 'lucide-react';

export default function NavBar() {
  // Hook's
  const { isConnected } = useMqtt();
  // State's
  // Effect's
  // Handler's
  // Render's
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:px-6 dark:border-zinc-800 dark:bg-gray-900 transition-transform duration-300">
      <div className="ml-auto flex items-center gap-4">
        <div
          className={`flex justify-center items-center gap-0 border rounded-md pr-2
            ${isConnected
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/60'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/60'
            }`
          }
        >
          <Dot
            size={32}
            className={isConnected
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
            }
          />
          <span className={`text-sm font-medium
            ${isConnected
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
            }`
          }>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2 h-9 w-9 rounded-full px-2 py-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
            aria-label="User menu"
          >
            <Bell size={18} />
            {1 > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 dark:bg-red-700 text-[10px] font-medium text-white">
                2
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
            aria-label="User profile"
          >
            <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center dark:bg-white/10">
              <User size={18} />
            </div>
            <span className="text-sm font-medium hidden md:block">
              Administrador
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}
