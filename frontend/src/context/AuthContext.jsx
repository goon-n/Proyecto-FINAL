import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar si hay un usuario logueado al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Si hay token, intentar obtener el usuario
            if (authService.isAuthenticated()) {
                const result = await authService.getProfile();
                
                if (result.success) {
                    console.log("Usuario autenticado:", result.data);
                    setUser(result.data);
                } else {
                    console.log("Token inválido o expirado");
                    setUser(null);
                    authService.logout();
                }
            } else {
                console.log("No hay token guardado");
                setUser(null);
            }
        } catch (error) {
            console.error("Error en checkAuth:", error);
            setUser(null);
            authService.logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);

            if (result.success) {
                setUser(result.user);
                return result.user;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error en login:", error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            authService.logout();
            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Error en logout:", error);
        }
    };

    const register = async (username, password, email) => {
        try {
            const result = await authService.register(username, password, email);

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error en registro:", error.message);
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
