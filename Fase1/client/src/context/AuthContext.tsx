"use client";

import { redirect } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

const userAdmin = {
    username: "admin@siepa.com",
    password: "admin"
}

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    userData: { id: number; name: string; email: string } | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Hook's
    // State's
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userData, setUserData] = useState<{ id: number; name: string; email: string } | null>(null);

    // Effect's
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setIsAuthenticated(true);
        if (!storedToken) {
            setIsAuthenticated(false);
            localStorage.setItem("authSesion", 'false');
        }
        return () => { }
    }, []);

    // Handler's
    const login = async (username: string, password: string) => {
        if (username === userAdmin.username && password === userAdmin.password) {
            setIsAuthenticated(true);
            setUserData({
                id: 1,
                name: "Administrador",
                email: userAdmin.username
            });
            localStorage.setItem("authSesion", 'true');
            document.cookie = "auth=true; path=/;";
            redirect("/dashboard");
        } else {
            alert("Credenciales incorrectas");
        }
    }
    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("authSesion");
        document.cookie = "auth=; path=/; max-age=0"; // Clear cookie
        redirect("/");
    }
    // Render's
    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userData }}>
            {children}
        </AuthContext.Provider>
    );
}