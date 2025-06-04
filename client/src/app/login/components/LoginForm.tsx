'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const loggedIn = localStorage.getItem('isLoggedIn');
      if (loggedIn === 'true') {
        router.push('/dashboard');
      }
    }
  }, [isClient]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === '12345') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  if (!isClient) return null;

  return (
  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full">
    <Image
      src="/invernadero.jpg"
      alt="Invernadero"
      width={200}
      height={120}
      className="mx-auto rounded mb-4"
      priority
    />
    <h2 className="text-2xl font-bold mb-4 text-center text-green-700 dark:text-green-400">
      Iniciar Sesión
    </h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa la contraseña"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
      >
        Entrar
      </button>
    </form>
  </div>
);

}
