// src/components/cuotas/DescontarClaseManual.jsx - NUEVO COMPONENTE

import { useState, useEffect } from "react";
import { Search, Zap, User, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../../api/api";
import toast from "react-hot-toast";

const DescontarClaseManual = () => {
    const [cuotas, setCuotas] = useState([]);
    const [cuotasFiltradas, setCuotasFiltradas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(null);

    useEffect(() => {
        cargarCuotasActivas();
    }, []);

    useEffect(() => {
        filtrarCuotas();
    }, [busqueda, cuotas]);

    const cargarCuotasActivas = async () => {
        try {
            setLoading(true);
            const data = await api.listarCuotas();
            
            // Filtrar solo cuotas activas
            const activas = data.filter(c => c.estado === 'activa');
            
            setCuotas(activas);
            setCuotasFiltradas(activas);
        } catch (error) {
            console.error("Error al cargar cuotas:", error);
            toast.error("Error al cargar las cuotas activas");
        } finally {
            setLoading(false);
        }
    };

    const filtrarCuotas = () => {
        if (!busqueda) {
            setCuotasFiltradas(cuotas);
            return;
        }

        const filtradas = cuotas.filter(c =>
            c.socio_username?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.socio_nombre?.toLowerCase().includes(busqueda.toLowerCase())
        );

        setCuotasFiltradas(filtradas);
    };

    const handleDescontar = async (cuota) => {
        if (cuota.plan_info?.tipo_limite === 'libre') {
            toast.error("Este socio tiene pase libre, no se descuentan clases");
            return;
        }

        if (cuota.clases_restantes <= 0) {
            toast.error("Este socio no tiene clases disponibles");
            return;
        }

        const confirmar = window.confirm(
            `¿Confirmar descuento de 1 clase para ${cuota.socio_username}?\n\n` +
            `Clases actuales: ${cuota.clases_restantes}/${cuota.clases_totales}\n` +
            `Clases después: ${cuota.clases_restantes - 1}/${cuota.clases_totales}`
        );

        if (!confirmar) return;

        try {
            setProcesando(cuota.id);
            const response = await api.descontarClaseManual(cuota.id);
            
            toast.success(response.detail || "Clase descontada exitosamente");
            
            // Recargar cuotas
            await cargarCuotasActivas();
        } catch (error) {
            console.error("Error al descontar clase:", error);
            toast.error(error.response?.data?.detail || "Error al descontar la clase");
        } finally {
            setProcesando(null);
        }
    };

    const getColorClases = (clases_restantes, clases_totales) => {
        if (clases_restantes === 0) return "text-red-600";
        const porcentaje = (clases_restantes / clases_totales) * 100;
        if (porcentaje <= 33) return "text-orange-600";
        if (porcentaje <= 66) return "text-yellow-600";
        return "text-green-600";
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Cargando socios...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Descontar Clase Manual
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                    Registra la entrada de un socio que vino sin turno reservado
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar socio por nombre o usuario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Lista de socios */}
                {cuotasFiltradas.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {busqueda 
                                ? "No se encontraron socios con ese nombre" 
                                : "No hay socios con cuotas activas"}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {cuotasFiltradas.map((cuota) => {
                            const esLibre = cuota.plan_info?.tipo_limite === 'libre';
                            const sinClases = !esLibre && cuota.clases_restantes === 0;

                            return (
                                <div
                                    key={cuota.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${
                                        sinClases ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{cuota.socio_username}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {cuota.plan_nombre}
                                            </p>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                <Zap className="h-3 w-3 mr-1" />
                                                {esLibre 
                                                    ? 'Ilimitadas' 
                                                    : `${cuota.clases_restantes}/${cuota.clases_totales} clases`
                                                }
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleDescontar(cuota)}
                                        disabled={sinClases || procesando === cuota.id || esLibre}
                                        className={sinClases ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}
                                    >
                                        {procesando === cuota.id ? (
                                            <>Procesando...</>
                                        ) : esLibre ? (
                                            <>Pase Libre</>
                                        ) : sinClases ? (
                                            <>Sin Clases</>
                                        ) : (
                                            <>
                                                <Zap className="h-4 w-4 mr-1" />
                                                Descontar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DescontarClaseManual;