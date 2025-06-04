'use client';
//import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


const GraficarDatos = () =>{
    const data = [
        { nombre: 'A', valor: 30 },
        { nombre: 'B', valor: 80 }
      ];
    
      return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-4">
        Historial de Datos
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="nombre" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px', borderColor: '#d1d5db' }} 
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="valor" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficarDatos;

