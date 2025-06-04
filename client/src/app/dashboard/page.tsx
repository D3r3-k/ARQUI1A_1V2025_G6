'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    }
  }, [isClient]);

  if (!isClient) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard</h1>
      <button
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        onClick={() => {
          localStorage.removeItem('isLoggedIn');
          router.push('/login');
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
