import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import HomeAdmin from "./pages/HomeAdmin";
import HomeEntrenador from "./pages/HomeEntrenador";
import HomeSocio from "./pages/HomeSocio";
import GestionUsuarios from "./pages/GestionUsuarios";
import { useAuth } from "./context/AuthContext";

// Componente para rutas privadas según rol
function PrivateRoute({ children, rolPermitido }) {
  const { user, loading } = useAuth();

  console.log("PrivateRoute - User:", user, "Loading:", loading); // <-- DEBUG

  if (loading) {
    return <p className="text-white text-center mt-10">Cargando...</p>;
  }
  
  if (!user) {
    console.log("No hay usuario, redirigiendo a login"); // <-- DEBUG
    return <Navigate to="/" replace />;
  }
  
  if (rolPermitido && user.rol !== rolPermitido) {
    console.log(`Rol incorrecto. Esperado: ${rolPermitido}, Actual: ${user.rol}`); // <-- DEBUG
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
          path="/admin"
          element={
            <PrivateRoute rolPermitido="admin">
              <HomeAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute rolPermitido="admin">
              <GestionUsuarios />
            </PrivateRoute>
          }
        />
        
        {/* Ruta del Entrenador */}
        <Route
          path="/entrenador"
          element={
            <PrivateRoute rolPermitido="entrenador">
              <HomeEntrenador />
            </PrivateRoute>
          }
        />
        
        {/* Ruta del Socio */}
        <Route
          path="/socio"
          element={
            <PrivateRoute rolPermitido="socio">
              <HomeSocio />
            </PrivateRoute>
          }
        />
        
        {/* Ruta por defecto - cualquier ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}