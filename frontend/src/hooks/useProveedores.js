import { useState, useEffect } from "react";
import api from "../api/api"; // ✅ Importar api.js

export const useProveedores = () => {
  const [proveedoresActivos, setProveedoresActivos] = useState([]);
  const [proveedoresDesactivados, setProveedoresDesactivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Usar api.js que ya tiene configurado /general/ y JWT
      const [dataActivos, dataDesactivados] = await Promise.all([
        api.listarProveedoresActivos(),
        api.listarProveedoresDesactivados(),
      ]);

      setProveedoresActivos(dataActivos || []);
      setProveedoresDesactivados(dataDesactivados || []);
    } catch (err) {
      setError(err.message || "Error al cargar proveedores");
      console.error("Error en fetchProveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  return {
    proveedoresActivos,
    proveedoresDesactivados,
    loading,
    error,
    refetch: fetchProveedores,
  };
};