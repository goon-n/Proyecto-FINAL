// src/hooks/useUsuarios.js
import { useState, useEffect } from "react";
import api from "../api/api"; // ← Usar tu API centralizada

export const useUsuarios = () => {
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [usuariosDesactivados, setUsuariosDesactivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Para entrenadores, solo cargar usuarios activos
      const dataActivos = await api.listarUsuarios();
      setUsuariosActivos(dataActivos);
      
      // Solo intentar cargar desactivados si no hay error
      try {
        const dataDesactivados = await api.listarUsuariosDesactivados();
        setUsuariosDesactivados(dataDesactivados);
      } catch (err) {
        // Si falla (ej: entrenador sin permisos), dejar array vacío
        console.log("No se pueden cargar usuarios desactivados (puede ser por permisos)");
        setUsuariosDesactivados([]);
      }
      
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.response?.data?.detail || err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuariosActivos,
    usuariosDesactivados,
    loading,
    error,
    refetch: fetchUsuarios
  };
};