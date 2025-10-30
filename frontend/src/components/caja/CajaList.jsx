import React, { useEffect, useState } from "react";
import { getCajas } from "../../services/caja.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

export default function CajaList({ reload, onEditar, onHistorial }) {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCajas = async (page = 1) => {
  setLoading(true);
  setError("");
  try {
    const res = await getCajas(page);
    
    console.log("Respuesta completa:", res.data); 
    
    // Django REST Framework devuelve la data paginada en este formato
    if (res.data.results) {
      setCajas(res.data.results);
      setTotalCount(res.data.count);
      const calculatedPages = Math.ceil(res.data.count / 10);
      console.log("Total count:", res.data.count); 
      console.log("Páginas calculadas:", calculatedPages); 
      setTotalPages(calculatedPages);
    } else {
      // Si no hay paginación (por alguna razón)
      setCajas(res.data);
      setTotalCount(res.data.length);
      setTotalPages(1);
    }
  } catch (error) {
    console.error("Error al cargar cajas:", error); 
    setError("No se pudieron cargar las cajas.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCajas(currentPage);
  }, [reload, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando cajas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Historial de Cajas</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {totalCount} caja{totalCount !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {cajas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay cajas registradas.
          </p>
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Abierta por</TableHead>
                    <TableHead>Fecha Apertura</TableHead>
                    <TableHead>Cerrada por</TableHead>
                    <TableHead>Fecha Cierre</TableHead>
                    <TableHead className="text-right">Monto Inicial</TableHead>
                    <TableHead className="text-right">Monto Final</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cajas.map(caja => (
                    <TableRow key={caja.id}>
                      <TableCell className="font-medium">#{caja.id}</TableCell>
                      <TableCell>
                        <Badge variant={caja.estado === 'ABIERTA' ? 'default' : 'secondary'}>
                          {caja.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {caja.empleado_apertura_nombre || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDateTime(caja.fecha_apertura)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {caja.empleado_cierre_nombre || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDateTime(caja.fecha_cierre)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {formatMoney(caja.monto_inicial)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {caja.estado === 'CERRADA' 
                            ? formatMoney(caja.closing_system_amount) 
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {caja.estado === 'ABIERTA' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onEditar(caja.id)}
                          >
                            Gestionar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onHistorial(caja.id)}
                        >
                          Ver Historial
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium px-2">
                    {currentPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}