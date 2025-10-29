import React, { useState } from "react";
import CajaList from "../components/caja/CajaList";
import CajaAdd from "../components/caja/CajaAdd";
import CajaEdit from "../components/caja/CajaEdit";
import MovimientoCajaHistorial from "../components/caja/MovimientoCajaHistorial";
import { Toaster } from "react-hot-toast";
import { FaCashRegister, FaCreditCard, FaExchangeAlt, FaSearch, FaCubes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


export default function CajaPage() {
  const [reload, setReload] = useState(false);
  const [vista, setVista] = useState({ modo: "list" });
  const [buscar, setBuscar] = useState("");
  const navigate = useNavigate();

  // Handlers para navegación interna
  const mostrarListado = () => setVista({ modo: "list" });
  const mostrarEditar = id => setVista({ modo: "edit", cajaId: id });
  const mostrarHistorial = id => setVista({ modo: "historial", cajaId: id });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-blue-900 font-extrabold flex items-center gap-2">
          <FaCubes className="text-blue-700" /> Gestión de Caja
        </h1>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition shadow ml-4"
          onClick={() => navigate("/admin")}
        >
          Volver al Panel
        </button>
        <Toaster position="top-right" />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Resumen financiero avanzado */}
        <aside className="lg:col-span-1 order-last lg:order-first">
          <div className="sticky top-4">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow p-6 flex flex-col space-y-2 items-center animate-fade-in">
              <h4 className="font-bold text-gray-700 mb-1">Resumen financiero</h4>
              {/* Aquí deberías recibir estos datos como props o vía contexto */}
              <span className="text-xs text-gray-500">Total efectivo: <b>$...</b></span>
              <span className="text-xs text-gray-500">Total tarjeta: <b>$...</b></span>
              <span className="text-xs text-gray-500">Total transferencia: <b>$...</b></span>
              {/* Barra visual */}
              <div className="w-full rounded h-4 bg-gray-200 flex mt-2 mb-1">
                <div style={{width:'33%'}} className="bg-green-400 h-4 rounded-l"></div>
                <div style={{width:'33%'}} className="bg-blue-400 h-4"></div>
                <div style={{width:'34%'}} className="bg-red-400 h-4 rounded-r"></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">Gastos <span className="text-red-500">$....</span> / Ingresos <span className="text-green-500">$....</span></div>
            </div>
          </div>
        </aside>
        {/* Panel principal de caja */}
        <main className="lg:col-span-4 space-y-8">
          {vista.modo === "list" && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-white rounded-lg shadow-lg p-6 transition hover:scale-105 duration-200">
                <CajaAdd onChange={() => setReload(!reload)} />
              </section>
              <section className="bg-white rounded-lg shadow-lg p-6 transition hover:scale-105 duration-200">
                {/* Filtro y búsqueda avanzada */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <label className="font-semibold flex items-center gap-1">
                    <FaSearch /> Buscar:
                  </label>
                  <input
                    className="border px-2 py-1 rounded shadow"
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="descripción, ID, monto ..."
                  />
                </div>
                {/* <CajaList ... filtrar por búsqueda y tipos si lo pasas por props */}
                <CajaList
                  reload={reload}
                  onEditar={mostrarEditar}
                  onHistorial={mostrarHistorial}
                  buscar={buscar}
                />
              </section>
            </div>
          )}
          {vista.modo === "edit" && (
            <div className="animate-fade-in">
              <button className="mb-3 px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 transition" onClick={mostrarListado}>Volver</button>
              <CajaEdit id={vista.cajaId} onGuardado={mostrarListado} />
            </div>
          )}
          {vista.modo === "historial" && (
            <div className="animate-fade-in">
              <button className="mb-3 px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 transition" onClick={mostrarListado}>Volver</button>
              <MovimientoCajaHistorial cajaId={vista.cajaId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
