import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Proveedores = () => {
  const { user, loading: authLoading } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    activo: true
  });

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      
      const filtros = {};
      if (filtroActivo !== 'todos') {
        filtros.activo = filtroActivo === 'activos';
      }
      if (search) {
        filtros.search = search;
      }
      
      console.log('Cargando proveedores con filtros:', filtros);
      const data = await api.listarProveedores(filtros);
      console.log('Proveedores cargados:', data);
      setProveedores(data);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      
      // Si es un error de autenticación, mostrar mensaje específico
      if (err.message.includes('Authentication credentials') || err.message.includes('401')) {
        setError('❌ No estás autenticado. Por favor, inicia sesión y vuelve a intentar.');
      } else {
        setError('Error al cargar proveedores: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); // Limpiar errores previos
      console.log('Enviando datos:', formData); // Debug
      
      if (proveedorEditando) {
        const result = await api.editarProveedor(proveedorEditando.id, formData);
        console.log('Proveedor editado:', result);
      } else {
        const result = await api.crearProveedor(formData);
        console.log('Proveedor creado:', result);
      }
      setModalAbierto(false);
      resetForm();
      cargarProveedores();
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      setError('Error al guardar proveedor: ' + err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.eliminarProveedor(id);
      cargarProveedores();
    } catch (err) {
      setError('Error al eliminar proveedor: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      activo: true
    });
    setProveedorEditando(null);
  };

  const abrirModalEditar = (proveedor) => {
    setProveedorEditando(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      activo: proveedor.activo
    });
    setModalAbierto(true);
  };

  const abrirModalCrear = () => {
    resetForm();
    setModalAbierto(true);
  };

  useEffect(() => {
    if (user) {
      cargarProveedores();
    }
  }, [search, filtroActivo, user]);

  // Mostrar carga de autenticación
  if (authLoading) return <div className="p-4">Verificando autenticación...</div>;
  
  // Verificar autenticación
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">No autenticado</h3>
          <p>Necesitas iniciar sesión para acceder a esta página.</p>
          <p>Por favor, ve a la página de <a href="/" className="underline">inicio de sesión</a>.</p>
        </div>
      </div>
    );
  }
  
  // Verificar permisos de admin
  if (user.rol !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h3 className="font-bold">Sin permisos</h3>
          <p>Solo los administradores pueden acceder a esta página.</p>
          <p>Tu rol actual es: <strong>{user.rol}</strong></p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-4">Cargando proveedores...</div>;

  return (
    <div className="p-6">
      <AdminHeader 
        title="Gestión de Proveedores" 
        subtitle="Administra los proveedores del gimnasio"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Lista de Proveedores</h2>
          <p className="text-gray-600">Gestiona la información de los proveedores</p>
        </div>
        <Button onClick={abrirModalCrear}>
          Agregar Proveedor
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por nombre</Label>
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escriba el nombre del proveedor..."
              />
            </div>
            <div className="w-48">
              <Label htmlFor="estado">Estado</Label>
              <Select value={filtroActivo} onValueChange={setFiltroActivo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores ({proveedores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Accesorios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                  <TableCell>{proveedor.telefono || 'N/A'}</TableCell>
                  <TableCell>{proveedor.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {proveedor.accesorios_count} accesorios
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={proveedor.activo ? "success" : "secondary"}>
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(proveedor.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalEditar(proveedor)}
                      >
                        Editar
                      </Button>
                      {proveedor.activo && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción desactivará el proveedor "{proveedor.nombre}". 
                                Podrás reactivarlo más tarde si es necesario.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleEliminar(proveedor.id)}
                              >
                                Desactivar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {proveedores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron proveedores con los filtros seleccionados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar proveedor */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {proveedorEditando ? 'Editar Proveedor' : 'Agregar Proveedor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            {proveedorEditando && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                />
                <Label htmlFor="activo">Activo</Label>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {proveedorEditando ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Proveedores;