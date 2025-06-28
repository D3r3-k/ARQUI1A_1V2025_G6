import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import FormLogin from './components/FormLogin/FormLogin'

// Metadata for the Login Page
export const generateMetadata = () => {
    return {
        title: "Iniciar Sesión - SIEPA",
        description: "Accede a tu cuenta de SIEPA para gestionar el sistema y realizar configuraciones avanzadas.",
    }
}

export default function LoginPage() {
    // Hook's
    // State's
    // Effect's
    // Handler's
    // Render's
    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
            <Link
                href="/"
                className="absolute left-4 top-4 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors group font-semibold"
            >
                <ArrowLeft className="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="transition-all duration-200 group-hover:underline">
                    Volver al inicio
                </span>
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center items-end">
                    <Image
                        src="/short-logo.svg"
                        alt="SIEPA Logo"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                    <span className="ml-2 text-5xl font-semibold text-green-siepa">
                        SIEPA
                    </span>
                </div>
                <div className="rounded-lg bg-white/30 backdrop-blur-md p-8 shadow-lg transition-all duration-300 hover:shadow-xl border border-white/40">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">
                            Iniciar Sesión
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Accede a tu cuenta para continuar
                        </p>
                    </div>
                    <FormLogin />

                    <div className="mt-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative bg-white/60 px-4 text-xs uppercase text-gray-500">
                                Ó
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm flex gap-1 justify-center items-center">
                            <span className="text-gray-600">
                                ¿No tienes una cuenta?
                            </span>
                            <Link
                                href="/signup"
                                className="font-medium text-green-600 hover:underline transition-all"
                            >
                                Regístrate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
