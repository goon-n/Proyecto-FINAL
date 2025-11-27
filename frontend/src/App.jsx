// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import LandingPage from "./components/LandingPage";
import HomeAdmin from "./pages/HomeAdmin";
import HomeEntrenador from "./pages/HomeEntrenador";
import HomeSocio from "./pages/HomeSocio";
import GestionUsuarios from "./pages/GestionUsuarios";
import GestionProveedores from "./pages/GestionProveedores";
import GestionAccesorios from "./pages/GestionAccesorios";
import CajaPage from "./pages/CajaPage";
import GestionCompras from "./pages/GestionCompras";
import ControlMembresias from "./pages/ControlMembresias";
import AdminLayout from "./components/layout/AdminLayout";
import { useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import TurnosPage from "./pages/TurnosPage";
import Payment from "./pages/Payment";
import MembresiaSocio from "./pages/MembresiaSocio";
import Perfil from "./pages/Perfil";
import MisTurnosResumen from "./components/turnos/MisTurnosResumen";
import GestionReportes from "./pages/GestionReportes";
import './index.css';

function PrivateRoute({ children, rolesPermitidos }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-white text-center mt-10">Cargando...</p>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  const { user } = useAuth(); // ← AGREGAR ESTA LÍNEA (EL FIX)

  return (
    <BrowserRouter>
      <AlertProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          
          {/* Rutas del Admin */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute rolesPermitidos={["admin"]}>
                <AdminLayout>
                  <Routes>
                    <Route index element={<HomeAdmin />} />
                    <Route path="usuarios" element={<GestionUsuarios />} />
                    <Route path="proveedores" element={<GestionProveedores />} />
                    <Route path="accesorios" element={<GestionAccesorios />} />
                    <Route path="compras" element={<GestionCompras />} />
                    <Route path="caja" element={<CajaPage />} />
                    <Route path="turnos" element={<TurnosPage userRole="admin" />} />
                    <Route path="membresias" element={<ControlMembresias />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="reportes-accesorios" element={<GestionReportes />} />
                  </Routes>
                </AdminLayout>
              </PrivateRoute>
            }
          />
          
          {/* Rutas del Entrenador */}
          <Route
            path="/entrenador/*"
            element={
              <PrivateRoute rolesPermitidos={["entrenador"]}>
                <AdminLayout>
                  <Routes>
                    <Route index element={<HomeEntrenador />} />
                    <Route path="usuarios" element={<GestionUsuarios />} />
                    <Route path="accesorios" element={<GestionAccesorios />} />
                    <Route path="caja" element={<CajaPage />} />
                    <Route path="turnos" element={<TurnosPage userRole="entrenador" />} />
                    <Route path="membresias" element={<ControlMembresias />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="reportes-accesorios" element={<GestionReportes />} />
                  </Routes>
                </AdminLayout>
              </PrivateRoute>
            }
          />
          
          {/* Rutas del Socio */}
          <Route
            path="/socio"
            element={
              <PrivateRoute rolesPermitidos={["socio"]}>
                <HomeSocio />
              </PrivateRoute>
            }
          />
          <Route
            path="/socio/turnos"
            element={
              <PrivateRoute rolesPermitidos={["socio"]}>
                <TurnosPage userRole={"socio"} />
              </PrivateRoute>
            }
          />
          <Route
            path="/socio/membresia"
            element={
              <PrivateRoute rolesPermitidos={["socio"]}>
                <MembresiaSocio />
              </PrivateRoute>
            }
          />
          <Route
            path="/socio/perfil"
            element={
              <PrivateRoute rolesPermitidos={["socio"]}>
                <Perfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/socio/mis-turnos"
            element={
              <PrivateRoute rolesPermitidos={["socio"]}>
                <MisTurnosResumen />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
}