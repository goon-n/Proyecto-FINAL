import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import HomeAdmin from "./pages/HomeAdmin";
import HomeEntrenador from "./pages/HomeEntrenador";
import HomeSocio from "./pages/HomeSocio";
import GestionUsuarios from "./pages/GestionUsuarios";
import GestionProveedores from "./pages/GestionProveedores";
import GestionAccesorios from "./pages/GestionAccesorios";
import CajaPage from "./pages/CajaPage";
import GestionCompras from "./pages/GestionCompras";
import AdminLayout from "./components/layout/AdminLayout";
import { useAuth } from "./context/AuthContext";

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          }
        />
        
        {/* Rutas del Entrenador - USA EL MISMO LAYOUT */}
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
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          }
        />
        
        {/* Ruta del Socio */}
        <Route
          path="/socio"
          element={
            <PrivateRoute rolesPermitidos={["socio"]}>
              <HomeSocio />
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}