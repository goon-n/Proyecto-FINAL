import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  User,
  Users, 
  ShoppingBag, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar,
  CreditCard, // 👈 AÑADIDO
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Definir rutas base según rol
  const basePath = user?.rol === 'admin' ? '/admin' : '/entrenador';

  // Definir elementos del menú según rol
  const menuItems = [
    {
      name: "Dashboard",
      path: basePath,
      icon: Home,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Gestión de Usuarios",
      path: `${basePath}/usuarios`,
      icon: Users,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Cuotas", // 
      path: `${basePath}/membresias`,
      icon: CreditCard,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Turnos",
      path: `${basePath}/turnos`,
      icon: Calendar,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Caja",
      path: `${basePath}/caja`,
      icon: DollarSign,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Accesorios",
      path: `${basePath}/accesorios`,
      icon: Package,
      roles: ['admin', 'entrenador']
    },
    {
      name: "Proveedores",
      path: `${basePath}/proveedores`,
      icon: ShoppingBag,
      roles: ['admin'] // Solo admin
    },
    {
      name: "Compras",
      path: `${basePath}/compras`,
      icon: ShoppingCart,
      roles: ['admin'] // Solo admin
    },
    {
      name: "Mi Perfil", // 👈 ARREGLADO
      icon: User,
      path: `${basePath}/perfil`, // Ruta corregida
      roles: ['admin', 'entrenador'] // Roles añadidos
    },
  ];

  // Filtrar items según rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ADN-FIT</h1>
            <p className="text-sm text-gray-400 mt-1">
              {user?.rol === 'admin' ? 'Panel Admin' : 'Panel Entrenador'}
            </p>
          </div>
          
          {/* Botón cerrar para móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Cerrar sidebar en móvil al hacer clic
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg 
                      transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-800 text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="mb-3 px-4">
            <p className="text-sm text-gray-400">Usuario</p>
            <p className="font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">
              {user?.rol}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-white hover:bg-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;