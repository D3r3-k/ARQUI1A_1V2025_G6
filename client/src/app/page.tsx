"use client"

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import { ArrowRight, BarChart, CheckCircle, ChevronRight, ChevronUp, Cpu, Droplets, Smartphone, Sun, Thermometer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  // Hook's
  const featuresRef = useRef<HTMLDivElement | null>(null);
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
  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // Render's
  const showTopButton = isScrolled ? "block" : "hidden";

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slideRight">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Sistema <span className="text-green-600">Inteligente</span> de Evaluación y Predicción <span className="text-green-600">Ambiental</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              SIEPA es una plataforma avanzada que utiliza inteligencia artificial para analizar, evaluar y predecir condiciones ambientales, facilitando la toma de decisiones sostenibles y la gestión eficiente del entorno.
            </p>
            <div className="flex flex-col justify-end sm:flex-row gap-4 pt-4">
              <button
                onClick={handleScrollToFeatures}
                aria-label="Saber más sobre las características"
                className="bg-white hover:border-gray-400 text-gray-800 border border-gray-300 font-medium py-3 px-6 rounded-lg inline-flex items-center justify-center group transition-all duration-300 hover:bg-gray-50 cursor-pointer"
              >
                Saber más
                <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <div className="relative h-80 md:h-[500px] animate-fadeIn pointer-events-none">
            <Image
              src="/images/invernadero.jpeg"
              alt="Invernadero inteligente"
              fill
              className="object-cover rounded-xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Funciones potentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestra solución integral proporciona todo lo que necesita para supervisar y controlar el entorno de su invernadero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Thermometer className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Temperatura</h3>
              <p className="text-gray-600">Monitorea y controla la temperatura en tiempo real para mantener condiciones óptimas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Droplets className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Humedad</h3>
              <p className="text-gray-600">Supervisa y ajusta la humedad para favorecer el crecimiento saludable de las plantas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Cpu className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Movimiento</h3>
              <p className="text-gray-600">Detecta movimientos dentro del invernadero para mayor seguridad y control.</p>
            </div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Sun className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Iluminación</h3>
              <p className="text-gray-600">Gestiona la iluminación para asegurar la cantidad de luz adecuada para las plantas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <BarChart className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Presión</h3>
              <p className="text-gray-600">Supervisa la presión atmosférica para anticipar cambios ambientales.</p>
            </div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Droplets className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CO₂</h3>
              <p className="text-gray-600">Controla y analiza los niveles de dióxido de carbono para un crecimiento saludable.</p>
            </div>
            <div className="bg-transparent p-6 rounded-xl"></div>
            <div className="bg-white p-6 rounded-xl hover:shadow-lg border-gray-100 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="mb-4">
                <Smartphone className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Acceso móvil</h3>
              <p className="text-gray-600">Utiliza la plataforma fácilmente desde tu teléfono para monitorear y controlar el invernadero en cualquier momento y lugar.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cuales son las ventajas de SIEPA?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              SIEPA automatiza tu invernadero para mejorar la eficiencia, aumentar el rendimiento y reducir el impacto ambiental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative h-80 md:h-[400px]">
              <Image
                src="/images/maqueta.png"
                alt="Maqueta de invernadero inteligente"
                fill
                className="object-cover rounded-xl shadow-xl"
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Aumento de la Productividad
                  </h3>
                  <p className="text-gray-600">
                    Optimiza el crecimiento de las plantas con monitoreo y control precisos de las condiciones ambientales.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Eficiencia Energética
                  </h3>
                  <p className="text-gray-600">
                    Reduce el consumo de energía mediante el uso inteligente de recursos y tecnologías sostenibles.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Monitoreo en Tiempo Real
                  </h3>
                  <p className="text-gray-600">
                    Accede a datos en tiempo real sobre las condiciones del invernadero desde cualquier lugar y en cualquier momento.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Toma de Decisiones Informadas
                  </h3>
                  <p className="text-gray-600">
                    Utiliza análisis avanzados para tomar decisiones basadas en datos, mejorando la gestión del invernadero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-green-600 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Image
            src="/logo.svg"
            alt="Logo de SIEPA"
            width={150}
            height={150}
            className="mx-auto mb-6"
            style={{ filter: "invert(1)" }}
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Por qué esperar más?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-3xl mx-auto">
            Únete a la revolución de la agricultura inteligente con SIEPA. Nuestra plataforma avanzada te permite monitorear y controlar tu invernadero de manera eficiente, asegurando un crecimiento óptimo de tus plantas y una gestión sostenible de los recursos.
          </p>
          <Link
            href="/login"
            className="bg-white text-green-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors inline-flex items-center"
          >
            Comienza ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Top Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className={`bg-green-500 text-white hover:bg-green-600 transition-colors p-3 rounded-full shadow-lg cursor-pointer ${showTopButton}`}
        >
          <ChevronUp className="h-6 w-6 transform" />
        </button>
      </div>
      <Footer />
    </main>
  );
}
