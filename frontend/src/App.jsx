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
import TurnosPage from "./pages/TurnosPage";
import Payment from "./pages/Payment";
import MembresiaSocio from "./pages/MembresiaSocio";

function PrivateRoute({ children, rolesPermitidos }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
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
              <TurnosPage userRole="socio" />
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
        
        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}