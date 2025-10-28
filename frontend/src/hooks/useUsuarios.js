// src/hooks/useUsuarios.js

import { useState, useEffect } from "react";

/**
 * Hook para manejar la lógica de usuarios (activos y desactivados)
 * Lo usás así: const { usuariosActivos, usuariosDesactivados, loading, error, refetch } = useUsuarios();
 */
export const useUsuarios = () => {
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [usuariosDesactivados, setUsuariosDesactivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Hacemos las dos peticiones al mismo tiempo
      const [responseActivos, responseDesactivados] = await Promise.all([
        fetch("http://localhost:8000/api/usuarios/", { 
          credentials: "include" 
        }),
        fetch("http://localhost:8000/api/usuarios/desactivados/", { 
          credentials: "include" 
        })
      ]);
      
      if (responseActivos.ok && responseDesactivados.ok) {
        const dataActivos = await responseActivos.json();
        const dataDesactivados = await responseDesactivados.json();
        setUsuariosActivos(dataActivos);
        setUsuariosDesactivados(dataDesactivados);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta cuando se monta el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Retornamos todo lo que el componente necesita
  return {
    usuariosActivos,
    usuariosDesactivados,
    loading,
    error,
    refetch: fetchUsuarios  // Para volver a cargar cuando se necesite
  };
};