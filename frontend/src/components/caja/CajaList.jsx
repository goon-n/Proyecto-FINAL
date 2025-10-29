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

export default function CajaList({ reload, onEditar, onHistorial }) {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCajas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCajas();
      setCajas(res.data);
    } catch {
      setError("No se pudieron cargar las cajas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajas();
  }, [reload]);

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
        <CardTitle>Historial de Cajas</CardTitle>
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Apertura</TableHead>
                  <TableHead>Monto Inicial</TableHead>
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
                      {new Date(caja.fecha_apertura).toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>${caja.monto_inicial}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}

    