"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Navbar() {
    // Hook's
    // State's
    const [isScrolled, setIsScrolled] = useState<boolean>(false)
    // Effect's
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }
        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])
    // Handler's
    // Render
    const scrolledClass = isScrolled ? "bg-white/80 backdrop-blur-md shadow-lg" : "bg-transparent shadow-sm"

    return (
        <nav className={`fixed top-0 left-0 right-0 bg-white z-50 min-h-3 ${scrolledClass} p-2 transition-all duration-300 ease-in-out`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-end gap-x-2">
                        <Image src={"/short-logo.svg"} alt="Logo" width={48} height={48} className="mr-2" />
                        <span className="text-3xl font-bold text-green-600">SIEPA</span>
                    </Link>
                    <Link
                        href="/login"
                        className="bg-green-600 text-white hover:bg-green-700 transition-colors px-4 py-2 rounded-md font-medium"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </nav>
    )
}
