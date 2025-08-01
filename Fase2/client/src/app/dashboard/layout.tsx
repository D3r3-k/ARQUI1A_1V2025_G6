import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Sidebar from "./components/Sidebar/Sidebar";
import NavBar from "./components/NavBar/NavBar";
import { MqttProvider } from "@/context/MqttContext";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
    title: "Dashboard - Módulo de Administración de SIEPA",
    description: "Accede al panel de administración de SIEPA para gestionar usuarios, monitorear el sistema y realizar configuraciones avanzadas.",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex min-h-screen flex-col">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <MqttProvider>
                    <Sidebar />
                    <div className="flex-1 lg:pl-64 bg-white dark:bg-gray-900">
                        <NavBar />
                        {children}
                    </div>
                    <ToastContainer newestOnTop stacked/>
                </MqttProvider>
            </ThemeProvider>
        </main>
    );
}
