"use client"

import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMobile";
import { useMqtt } from "@/hooks/useMqtt";
import { AlertOctagon, BarChart2, ChevronRight, LayoutDashboard, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  // Hook's
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { alertCount } = useMqtt();
  const isMobile = useIsMobile();
  const path = usePathname();

  // State's
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Effect's
  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  // Handler's
  const handleThemeChange = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };
  const handleSidebarOpen = () => {
    setIsOpen(!isOpen);
  };

  // Render's
  const getNavClass = (route: string) =>
    path === route
      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200";
  return (
    <>
      {/* Overlay para moviles */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 dark:bg-black/20 backdrop-blur-sm"
          onClick={handleSidebarOpen}
        />
      )}
      {/* Pestaña para moviles */}
      <div
        onClick={handleSidebarOpen}
        className={`md:hidden fixed z-50 top-1/2 left-0 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 rounded-r-lg py-4 px-3.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 ${!isOpen ? "translate-x-0 transition-transform duration-300" : "-translate-x-full transition-transform duration-300"
          }`}
      >
        <ChevronRight size={16} />
      </div>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-50 flex h-full w-64 flex-col shadow-xl border-r border-gray-200 dark:border-zinc-800 bg-gray-900
        dark:bg-gray-800 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:shadow-none md:bg-transparent
          `}
      >
        <div className="flex h-14 items-center border-b border-gray-200 dark:border-zinc-800 px-4 bg-white dark:bg-gray-900">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
            <Image
              src="/short-logo.svg"
              alt="Logo"
              width={24}
              height={24}
            />
            <span className="text-xl font-bold tracking-wide md:inline">SIEPA</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto p-2 bg-white dark:bg-gray-900">
          <nav className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all bg-primary text-sm
                ${getNavClass("/dashboard")}`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/historico"
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all bg-primary text-sm
                ${getNavClass("/dashboard/historico")}`}
            >
              <BarChart2 size={16} />
              <span>Panel Histórico</span>
            </Link>
            <Link
              href="/dashboard/control"
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all bg-primary text-sm
                ${getNavClass("/dashboard/control")}`}
            >
              <Settings size={16} />
              <span>Panel de control</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-gray-900 p-4">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            <AlertOctagon size={16} />
            Alertas
          </span>
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {alertCount > 0 ? `Tienes ${alertCount} alerta${alertCount > 1 ? "s" : ""}` : "No hay alertas activas"}
            </span>
          </div>
        </div>
        <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleThemeChange}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 dark:hover:bg-white/10 hover:bg-gray-800/10 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <>
                  <Sun size={16} />
                  <span>Modo claro</span>
                </>
              ) : (
                <>
                  <Moon size={16} />
                  <span>Modo oscuro</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 dark:hover:bg-white/10 hover:bg-gray-800/10 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside >
    </>
  )
}
