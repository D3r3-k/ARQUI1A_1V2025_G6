"use client";

import { Database } from 'lucide-react';
import React, { useEffect, useState } from 'react'

interface Documento {
  _id: string;
  [key: string]: any;
}

export default function Page() {
  // Hooks

  // States
  const [collections, setCollections] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [datos, setDatos] = useState<Documento[]>([]);
  const [pagina, setPagina] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);

  // Effects
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections');
        const data: string[] = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('Error cargando colecciones:', err);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchDatos(selected, pagina);
    }
  }, [selected, pagina]);

  // Handlers
  const handleSelect = (col: string) => {
    setSelected(col);
    setPagina(1); // reset to first page
  };

  const fetchDatos = async (coleccion: string, pag: number) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coleccion, pagina: pag }),
      });
      const result = await res.json();
      setDatos(result.datos);
      setTotalPaginas(Math.ceil(result.total / 10));
    } catch (err) {
      console.error('Error al obtener documentos:', err);
    }
  };

  // Functions
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  const isDateField = (key: string, value: any): boolean => {
    if (typeof value !== 'string') return false;
    
    // Check if key suggests it's a date
    const dateKeywords = ['date', 'time', 'created', 'updated', 'timestamp'];
    const hasDateKeyword = dateKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    );
    
    // Check if value looks like a date
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    const looksLikeDate = dateRegex.test(value) || !isNaN(Date.parse(value));
    
    return hasDateKeyword || looksLikeDate;
  };

  const getOrderedKeys = (data: Documento[]): string[] => {
    if (data.length === 0) return [];
    
    const allKeys = Object.keys(data[0]);
    
    // Remove _id from the keys
    const filteredKeys = allKeys.filter(key => key !== '_id');
    
    // Define priority order for common fields
    const priorityFields = ['timestamp', 'date', 'time', 'created', 'updated'];
    const sensorFields = ['temperatura', 'humedad', 'luz', 'sensor', 'value', 'estado'];
    const locationFields = ['ubicacion', 'location', 'lat', 'lng', 'latitude', 'longitude'];
    
    // Sort keys by priority
    const sortedKeys = filteredKeys.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Priority fields first
      const aPriority = priorityFields.findIndex(field => aLower.includes(field));
      const bPriority = priorityFields.findIndex(field => bLower.includes(field));
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      // Sensor fields second
      const aSensor = sensorFields.findIndex(field => aLower.includes(field));
      const bSensor = sensorFields.findIndex(field => bLower.includes(field));
      
      if (aSensor !== -1 && bSensor !== -1) return aSensor - bSensor;
      if (aSensor !== -1) return -1;
      if (bSensor !== -1) return 1;
      
      // Location fields third
      const aLocation = locationFields.findIndex(field => aLower.includes(field));
      const bLocation = locationFields.findIndex(field => bLower.includes(field));
      
      if (aLocation !== -1 && bLocation !== -1) return aLocation - bLocation;
      if (aLocation !== -1) return -1;
      if (bLocation !== -1) return 1;
      
      // Alphabetical for the rest
      return a.localeCompare(b);
    });
    
    return sortedKeys;
  };

  // Renders
  return (
    <main className="flex-1 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reportes y Datos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explora y analiza los datos almacenados en las colecciones de MongoDB
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Collections Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                Colecciones
              </h2>

              <div className="space-y-2">
                {collections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Cargando colecciones...</p>
                  </div>
                ) : (
                  collections.map((col, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(col)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border ${selected === col
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{col}</span>
                        {selected === col && (
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Data Display */}
          <div className="lg:col-span-9">
            {!selected ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Selecciona una colección
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Elige una colección de la lista para ver sus datos y comenzar a explorar la información almacenada.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Collection Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {selected}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {datos.length > 0 ? `${datos.length} registros mostrados` : 'Cargando datos...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Activa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {datos.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Cargando datos de la colección...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {getOrderedKeys(datos).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                              >
                                <div className="flex items-center space-x-1">
                                  <span>{key}</span>
                                  {isDateField(key, datos[0][key]) && (
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {datos.map((doc, rowIndex) => {
                            const orderedKeys = getOrderedKeys(datos);
                            return (
                              <tr key={doc._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'}`}>
                                {orderedKeys.map((key) => (
                                  <td key={key} className="px-6 py-4 text-sm border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                                    <div className="max-w-xs text-gray-900 dark:text-gray-100">
                                      {typeof doc[key] === 'object' ? (
                                        <details className="cursor-pointer">
                                          <summary className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                            Ver objeto
                                          </summary>
                                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                            {JSON.stringify(doc[key], null, 2)}
                                          </pre>
                                        </details>
                                      ) : isDateField(key, doc[key]) ? (
                                        <span className="font-mono text-sm">{formatDate(doc[key])}</span>
                                      ) : (
                                        <span className="break-words">{String(doc[key])}</span>
                                      )}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {datos.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPagina(p => Math.max(1, p - 1))}
                          disabled={pagina === 1}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Anterior
                        </button>
                        <button
                          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                          disabled={pagina === totalPaginas}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                        >
                          Siguiente
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Página <span className="font-semibold">{pagina}</span> de{' '}
                          <span className="font-semibold">{totalPaginas}</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPagina(pageNum)}
                                className={`w-8 h-8 text-sm rounded-lg transition-colors ${pagina === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          {totalPaginas > 5 && (
                            <>
                              <span className="text-gray-400">...</span>
                              <button
                                onClick={() => setPagina(totalPaginas)}
                                className={`w-8 h-8 text-sm rounded-lg transition-colors ${pagina === totalPaginas
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                              >
                                {totalPaginas}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
