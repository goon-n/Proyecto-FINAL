// src/hooks/useAccesorios.js
import { useState, useEffect } from 'react';
import { 
  getAccesorios, 
  getAccesoriosActivos, 
  getAccesoriosInactivos,
  getAccesoriosByProveedor 
} from '../services/accesorios.service';

export const useAccesorios = () => {
  const [accesorios, setAccesorios] = useState([]);
  const [accesoriosActivos, setAccesoriosActivos] = useState([]);
  const [accesoriosInactivos, setAccesoriosInactivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccesorios = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resAll, resActivos, resInactivos] = await Promise.all([
        getAccesorios(),
        getAccesoriosActivos(),
        getAccesoriosInactivos()
      ]);
      
      setAccesorios(resAll.data);
      setAccesoriosActivos(resActivos.data);
      setAccesoriosInactivos(resInactivos.data);
    } catch (error) {
      setError(error.message || 'Error al cargar accesorios');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAccesorios();
  };

  useEffect(() => {
    fetchAccesorios();
  }, []);

  return {
    accesorios,
    accesoriosActivos,
    accesoriosInactivos,
    loading,
    error,
    refetch
  };
};