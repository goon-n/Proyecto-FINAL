// src/components/accesorios/AccesoriosList.jsx
import React, { useEffect, useState } from "react";
import { getAccesorios, deleteAccesorio } from "../../services/accesorios.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function AccesoriosList({ reload, onEditar }) {
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");
  const [vistaActual, setVistaActual] = useState("todos");

  const fetchAccesorios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAccesorios();
      setAccesorios(res.data);
    } catch (error) {
      setError("No se pudieron cargar los accesorios.");
      toast.error("Error al cargar accesorios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccesorios();
  }, [reload]);

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el accesorio "${nombre}"?`)) {
      try {
        await deleteAccesorio(id);
        toast.success("Accesorio eliminado correctamente");
        setAccesorios(prev => prev.filter(acc => acc.id !== id));
      } catch (error) {
        toast.error("Error al eliminar accesorio");
      }
    }
  };

  // Filtrar accesorios
  const accesoriosFiltrados = accesorios.filter(accesorio => {
    const coincideTexto = accesorio.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                         accesorio.descripcion?.toLowerCase().includes(filtro.toLowerCase()) ||
                         accesorio.proveedor_nombre?.toLowerCase().includes(filtro.toLowerCase());
    
    if (vistaActual === "activos") return coincideTexto && accesorio.activo;
    if (vistaActual === "inactivos") return coincideTexto && !accesorio.activo;
    return coincideTexto;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando accesorios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lista de Accesorios
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar accesorios..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={vistaActual === "todos" ? "default" : "outline"}
              onClick={() => setVistaActual("todos")}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={vistaActual === "activos" ? "default" : "outline"}
              onClick={() => setVistaActual("activos")}
              size="sm"
            >
              Activos
            </Button>
            <Button
              variant={vistaActual === "inactivos" ? "default" : "outline"}
              onClick={() => setVistaActual("inactivos")}
              size="sm"
            >
              Inactivos
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Compra</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accesoriosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {filtro ? "No se encontraron accesorios que coincidan con la búsqueda" : "No hay accesorios registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                accesoriosFiltrados.map((accesorio) => (
                  <TableRow key={accesorio.id}>
                    <TableCell className="font-medium">{accesorio.nombre}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={accesorio.descripcion}>
                        {accesorio.descripcion || "Sin descripción"}
                      </div>
                    </TableCell>
                    <TableCell>{accesorio.proveedor_nombre || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={accesorio.stock > 0 ? "default" : "destructive"}>
                        {accesorio.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={accesorio.activo ? "default" : "secondary"}>
                        {accesorio.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {accesorio.fecha_compra ? new Date(accesorio.fecha_compra).toLocaleDateString('es-ES') : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditar(accesorio)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(accesorio.id, accesorio.nombre)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {accesoriosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {accesoriosFiltrados.length} de {accesorios.length} accesorios
          </div>
        )}
      </CardContent>
    </Card>
  );
}