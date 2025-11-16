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
      const [dataActivos, dataDesactivados] = await Promise.all([
        api.listarUsuarios(),
        api.listarUsuariosDesactivados()
      ]);
      
      setUsuariosActivos(dataActivos);
      setUsuariosDesactivados(dataDesactivados);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.response?.data?.detail || "Error al cargar usuarios");
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