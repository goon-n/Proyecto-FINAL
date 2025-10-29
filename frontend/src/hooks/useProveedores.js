import { useState, useEffect } from "react";

export const useProveedores = () => {
  const [proveedoresActivos, setProveedoresActivos] = useState([]);
  const [proveedoresDesactivados, setProveedoresDesactivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ACTIVOS_URL = "http://localhost:8000/api/proveedores/activos/";  // ✅ CORREGIDO
  const DESACTIVADOS_URL = "http://localhost:8000/api/proveedores/desactivados/";

  const fetchProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resActivos, resDesactivados] = await Promise.all([
        fetch(ACTIVOS_URL, { credentials: "include" }),
        fetch(DESACTIVADOS_URL, { credentials: "include" }),
      ]);

      if (!resActivos.ok || !resDesactivados.ok) {
        throw new Error("Error al cargar proveedores");
      }

      const dataActivos = await resActivos.json();
      const dataDesactivados = await resDesactivados.json();

      setProveedoresActivos(dataActivos || []);
      setProveedoresDesactivados(dataDesactivados || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
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