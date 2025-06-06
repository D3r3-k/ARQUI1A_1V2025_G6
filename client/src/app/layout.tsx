import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "SIEPA - Sistema Inteligente de Evaluación y Predicción Ambiental",
  description: "SIEPA es una plataforma avanzada que utiliza inteligencia artificial para analizar, evaluar y predecir condiciones ambientales, facilitando la toma de decisiones sostenibles y la gestión eficiente del entorno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
