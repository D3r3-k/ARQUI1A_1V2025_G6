"use client"

import { useAuth } from '@/hooks/useAuth'
import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'

export default function FormLogin() {
    // Hook's
    const { login } = useAuth()
    // State's
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    // Effect's
    // Handler's
    const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await login(email, password);
    }
    const handleOnChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const handleOnChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }
    // Render's
    return (
        <form className="mt-8 space-y-6" onSubmit={handleOnSubmit}>
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full rounded-md border border-gray-200 bg-white/60 px-10 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-black autofill:bg-white autofill:text-black "
                        type="email"
                        id="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={handleOnChangeEmail}
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                        }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                    </label>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full rounded-md border border-gray-200 bg-white/60 pl-10 pr-2 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={handleOnChangePassword}
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full rounded-md bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-600/90 focus:outline-none focus:ring-2 focus:ring-green-600/20 active:bg-green-600/80 transition-all duration-300 hover:-translate-y-[2px] cursor-pointer"
            >
                Iniciar Sesión
            </button>
        </form>
    )
}
