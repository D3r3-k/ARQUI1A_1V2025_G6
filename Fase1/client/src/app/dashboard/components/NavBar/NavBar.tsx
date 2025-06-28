"use client";

import { useAuth } from '@/hooks/useAuth';
import { useMqtt } from '@/hooks/useMqtt';
import { AlertOctagon, ChevronDown, Dot, Droplet, Gauge, Lightbulb, Thermometer, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function NavBar() {
  // Hook's
  const { userData, logout } = useAuth();
  const { isConnected, alertCount, activeAlerts } = useMqtt();
  // State's
  const [showAlertDropdown, setShowAlertDropdown] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  // Effect's
  // cuando se da click fuera del dropdown, se cierra
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowAlertDropdown(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAlertDropdown, showUserDropdown])

  // Handler's
  const handleAlertClick = (mensaje: string) => {
    toast.error(mensaje, {
      position: "top-right",
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
  const handleToggleAlertDropdown = () => {
    setShowAlertDropdown(!showAlertDropdown);
  }
  const handleToggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  }
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
            className="flex items-center gap-2 h-9 w-9 rounded-full px-2 py-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer relative"
            aria-label="Alertas"
            onClick={handleToggleAlertDropdown}
          >
            <AlertOctagon size={22} />
            {alertCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 dark:bg-red-700 text-[10px] font-medium text-white">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>
          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg z-20">
              <div className="p-3 border-b border-gray-100 dark:border-zinc-800 font-semibold text-sm">
                Alertas
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {activeAlerts && activeAlerts.length > 0 ? (
                  activeAlerts.map((alert, idx) => (
                    <li key={idx}
                      onClick={() => handleAlertClick(alert.mensaje)}
                      className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex gap-2 items-center justify-around">
                        <div className="flex gap-1">
                          {
                            alert.sensor === 'temperature' ? (
                              <Thermometer />
                            ) : alert.sensor === 'humidity' ? (
                              <Droplet />
                            ) : alert.sensor === 'air_quality' ? (
                              <Gauge />
                            ) : alert.sensor === 'presence' ? (
                              <User />
                            ) : alert.sensor === 'light' ? (
                              <Lightbulb />
                            ) : <></>

                          }
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">Alerta del sensor de {
                            alert.sensor === 'temperature' ? 'temperatura' :
                              alert.sensor === 'humidity' ? 'humedad' :
                                alert.sensor === 'air_quality' ? 'calidad del aire' :
                                  alert.sensor === 'presence' ? 'presencia' :
                                    alert.sensor === 'light' ? 'luz' :
                                      'desconocido'
                          }</span>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{alert.fulldate}</span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No hay alertas
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
            aria-label="User profile"
            onClick={handleToggleUserDropdown}>
            <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center dark:bg-white/10">
              <User size={18} />
            </div>
            <span className="text-sm font-medium hidden md:block">
              {userData?.name || 'Usuario'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg z-20">
              <div className="p-3 border-b border-gray-100 dark:border-zinc-800 font-semibold text-sm">
                <span className="flex items-center gap-2">
                  <User size={16} />
                  {userData?.name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.email || 'Sin email'}
                </span>
              </div>
              <ul className="py-2">
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-red-600 dark:text-red-400 cursor-pointer">
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
