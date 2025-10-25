// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener CSRF token
  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Verificar si hay un usuario logueado al cargar
  useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/user/", {
      credentials: "include",
    });
    
    console.log("CheckAuth response:", response.status); // <-- DEBUG
    
    if (response.ok) {
      const data = await response.json();
      console.log("Usuario autenticado:", data); // <-- DEBUG
      setUser(data);
    } else {
      console.log("No autenticado"); // <-- DEBUG
    }
  } catch (error) {
    console.log("Error en checkAuth:", error); // <-- DEBUG
  } finally {
    setLoading(false);
  }
};

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8000/api/logout/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  const register = async (username, password, email, rol = "socio") => {
    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ username, password, email, rol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrarse");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en registro:", error);
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