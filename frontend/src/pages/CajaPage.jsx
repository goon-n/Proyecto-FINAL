import React, { useState } from "react";
import CajaList from "../components/caja/CajaList";
import CajaAdd from "../components/caja/CajaAdd";
import CajaEdit from "../components/caja/CajaEdit";
import MovimientoCajaHistorial from "../components/caja/MovimientoCajaHistorial";
import { Toaster } from "react-hot-toast";
import { FaCashRegister } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CajaPage() {
  const [reload, setReload] = useState(false);
  const [vista, setVista] = useState({ modo: "list" });
  const navigate = useNavigate();

  const mostrarListado = () => setVista({ modo: "list" });
  const mostrarEditar = id => setVista({ modo: "edit", cajaId: id });
  const mostrarHistorial = id => setVista({ modo: "historial", cajaId: id });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaCashRegister className="text-blue-600" />
            Gestión de Caja
          </h1>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Volver al Panel
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto">
        {vista.modo === "list" && (
          <div className="space-y-6">
            <CajaAdd onChange={() => setReload(!reload)}
            onAbrirCaja={(cajaId) => mostrarEditar(cajaId)}
             />
            <CajaList
              reload={reload}
              onEditar={mostrarEditar}
              onHistorial={mostrarHistorial}
            />
          </div>
        )}
        
        {vista.modo === "edit" && (
          <div>
            <Button variant="outline" onClick={mostrarListado} className="mb-4">
              ← Volver
            </Button>
            <CajaEdit id={vista.cajaId} onGuardado={mostrarListado} />
          </div>
        )}
        
        {vista.modo === "historial" && (
          <div>
            <Button variant="outline" onClick={mostrarListado} className="mb-4">
              ← Volver
            </Button>
            <MovimientoCajaHistorial cajaId={vista.cajaId} />
          </div>
        )}
      </div>
    </div>
  );
}