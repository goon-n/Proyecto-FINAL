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
import api from '../api/api';

const Accesorios = () => {
  const [accesorios, setAccesorios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [accesorioEditando, setAccesorioEditando] = useState(null);
  const [stockEditando, setStockEditando] = useState({ id: null, stock: 0 });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    proveedor: '',
    stock: 0,
    activo: true
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar proveedores activos
      const proveedoresData = await api.listarProveedores({ activo: true });
      setProveedores(proveedoresData);

      // Cargar accesorios con filtros
      const filtros = {};
      if (filtroActivo !== 'todos') {
        filtros.activo = filtroActivo === 'activos';
      }
      if (filtroProveedor !== 'todos') {
        filtros.proveedor = filtroProveedor;
      }
      if (search) {
        filtros.search = search;
      }
      
      const accesoriosData = await api.listarAccesorios(filtros);
      setAccesorios(accesoriosData);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (accesorioEditando) {
        await api.editarAccesorio(accesorioEditando.id, formData);
      } else {
        await api.crearAccesorio(formData);
      }
      setModalAbierto(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      setError('Error al guardar accesorio: ' + err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.eliminarAccesorio(id);
      cargarDatos();
    } catch (err) {
      setError('Error al eliminar accesorio: ' + err.message);
    }
  };

  const handleActualizarStock = async () => {
    try {
      await api.actualizarStock(stockEditando.id, stockEditando.stock);
      setModalStock(false);
      setStockEditando({ id: null, stock: 0 });
      cargarDatos();
    } catch (err) {
      setError('Error al actualizar stock: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      proveedor: '',
      stock: 0,
      activo: true
    });
    setAccesorioEditando(null);
  };

  const abrirModalEditar = (accesorio) => {
    setAccesorioEditando(accesorio);
    setFormData({
      nombre: accesorio.nombre,
      descripcion: accesorio.descripcion || '',
      proveedor: accesorio.proveedor,
      stock: accesorio.stock,
      activo: accesorio.activo
    });
    setModalAbierto(true);
  };

  const abrirModalCrear = () => {
    resetForm();
    setModalAbierto(true);
  };

  const abrirModalStock = (accesorio) => {
    setStockEditando({
      id: accesorio.id,
      stock: accesorio.stock
    });
    setModalStock(true);
  };

  const getStockBadgeVariant = (stock) => {
    if (stock === 0) return "destructive";
    if (stock <= 5) return "secondary";
    return "success";
  };

  useEffect(() => {
    cargarDatos();
  }, [search, filtroActivo, filtroProveedor]);

  if (loading) return <div className="p-4">Cargando accesorios...</div>;

  return (
    <div className="p-6">
      <AdminHeader 
        title="Gestión de Accesorios" 
        subtitle="Administra el inventario de accesorios del gimnasio"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Inventario de Accesorios</h2>
          <p className="text-gray-600">Gestiona el stock y la información de los accesorios</p>
        </div>
        <Button onClick={abrirModalCrear}>
          Agregar Accesorio
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
                placeholder="Escriba el nombre del accesorio..."
              />
            </div>
            <div className="w-48">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select value={filtroProveedor} onValueChange={setFiltroProveedor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los proveedores</SelectItem>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Tabla de accesorios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Accesorios ({accesorios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Compra</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accesorios.map((accesorio) => (
                <TableRow key={accesorio.id}>
                  <TableCell className="font-medium">{accesorio.nombre}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {accesorio.descripcion || 'Sin descripción'}
                  </TableCell>
                  <TableCell>{accesorio.proveedor_nombre}</TableCell>
                  <TableCell>
                    <Badge variant={getStockBadgeVariant(accesorio.stock)}>
                      {accesorio.stock} unidades
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={accesorio.activo ? "success" : "secondary"}>
                      {accesorio.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(accesorio.fecha_compra).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalStock(accesorio)}
                      >
                        Stock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalEditar(accesorio)}
                      >
                        Editar
                      </Button>
                      {accesorio.activo && (
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
                                Esta acción desactivará el accesorio "{accesorio.nombre}". 
                                Podrás reactivarlo más tarde si es necesario.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleEliminar(accesorio.id)}
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

          {accesorios.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron accesorios con los filtros seleccionados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar accesorio */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accesorioEditando ? 'Editar Accesorio' : 'Agregar Accesorio'}
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
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="proveedor">Proveedor *</Label>
              <Select
                value={formData.proveedor.toString()}
                onValueChange={(value) => setFormData({...formData, proveedor: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Stock inicial</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
              />
            </div>
            {accesorioEditando && (
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
                {accesorioEditando ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para actualizar stock */}
      <Dialog open={modalStock} onOpenChange={setModalStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nuevoStock">Nuevo stock</Label>
              <Input
                id="nuevoStock"
                type="number"
                min="0"
                value={stockEditando.stock}
                onChange={(e) => setStockEditando({
                  ...stockEditando,
                  stock: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalStock(false)}>
                Cancelar
              </Button>
              <Button onClick={handleActualizarStock}>
                Actualizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accesorios;