import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "Iniciar Sesión - SIEPA",
    description: "Accede a tu cuenta de SIEPA para gestionar el sistema y realizar configuraciones avanzadas.",
};

export default function LoginLayout({
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
