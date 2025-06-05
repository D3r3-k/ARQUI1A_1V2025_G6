import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {

    title: "Panel histórico - Módulo de Administración de SIEPA",
    description: "Accede al panel histórico de SIEPA para consultar registros, eventos y datos históricos del sistema.",
};

export default function DashboardHistoricoLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
