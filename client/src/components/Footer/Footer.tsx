import { Mail, MapPin, Phone, Twitter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  // Hook's
  // State's
  // Effect's
  // Handler's
  // Render's
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-end gap-2">
              <Image
                src="/short-logo.svg"
                alt="SIEPA Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-green-600">
                SIEPA
              </span>
            </Link>
            <p className="text-gray-600 mt-2">Sistema inteligente de monitoreo y control de invernaderos para un crecimiento óptimo de las plantas.</p>
          </div>
          <div className="md:col-start-4">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contactanos
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-gray-600">T-3 USAC</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-gray-600">+502 1234-5678</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-gray-600">info@siepa.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} SIEPA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
