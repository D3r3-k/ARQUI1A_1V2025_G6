import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {

    title: "Panel de Control - Módulo de Administración de SIEPA",
    description: "Accede al panel de control de SIEPA para gestionar usuarios, monitorear el sistema y realizar configuraciones avanzadas.",
};

export default function DashboardControlLayout({
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
