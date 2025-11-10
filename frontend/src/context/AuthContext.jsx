// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
// Importamos la instancia de Axios configurada para manejar cookies y CSRF
import axiosInstance from "../lib/axiosInstance"; // RUTA ASUMIDA: src/lib/axiosInstance.js

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // NOTA: La función getCSRFToken ya no es necesaria aquí si usamos axiosInstance,
    // ya que está implementada en el interceptor de axiosInstance.

    // Verificar si hay un usuario logueado al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Usamos axiosInstance.get, que envía cookies
            const response = await axiosInstance.get("/user/"); 
            
            console.log("CheckAuth response:", response.status); // <-- DEBUG
            
            if (response.status === 200) {
                const data = response.data;
                console.log("Usuario autenticado:", data); // <-- DEBUG
                setUser(data);
            } else {
                console.log("No autenticado"); // <-- DEBUG
            }
        } catch (error) {
            // Si la respuesta es 401 (Unauthorized), asumimos que no hay sesión.
            if (error.response && error.response.status === 401) {
                setUser(null);
            }
            console.log("Error en checkAuth:", error); // <-- DEBUG
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            // Usamos axiosInstance.post, que envía CSRF token automáticamente
            const response = await axiosInstance.post("/login/", { username, password });

            const data = response.data;
            setUser(data);
            return data;
        } catch (error) {
            console.error("Error en login:", error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Usamos axiosInstance.post, que envía CSRF token automáticamente
            await axiosInstance.post("/logout/"); 
            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Error en logout:", error);
        }
    };

    const register = async (username, password, email, rol = "socio") => {
        try {
            // Usamos axiosInstance.post, que envía CSRF token automáticamente
            const response = await axiosInstance.post("/register/", { username, password, email, rol });

            return response.data;
        } catch (error) {
            console.error("Error en registro:", error.response?.data?.error || error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}