// frontend/src/components/turnos/TurnosEdit.jsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from 'moment-timezone';
import { toast } from 'react-hot-toast'; 
import { updateTurno, deleteTurno } from '../../services/turnoService'; // 
import api from '../../api/api';

const ESTADOS = [
    { value: 'SOLICITUD', label: 'Cupo Libre (Disponible)' },
    { value: 'RESERVADO', label: 'Reservado (Pendiente de Confirmación)' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'CANCELADO', label: 'Cancelado/Liberado' },
    { value: 'FINALIZADO', label: 'Finalizado' },
];

const TurnosEdit = ({ turno, onUpdate, onCancel }) => {
    const [horaInicio, setHoraInicio] = useState(
        moment(turno.hora_inicio).format('YYYY-MM-DDTHH:mm')
    );
    const [estado, setEstado] = useState(turno.estado);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedMoment = moment(horaInicio);
        
        if (selectedMoment.minute() !== 0) {
            toast.error("La hora de inicio debe ser una hora en punto.");
            setLoading(false);
            return;
        }

        try {
            const hora_inicio_iso = selectedMoment.toISOString(); 

            await api.actualizarTurno(turno.id, { // 👈 CAMBIO
                hora_inicio: hora_inicio_iso,
                estado: estado,
            });
            
            toast.success("¡Turno actualizado exitosamente!");
            onUpdate();
            
        } catch (error) {
            console.error("Error al actualizar el turno:", error.response?.data);
            const detail = error.response?.data?.detail || "Error desconocido al actualizar.";
            toast.error(`Error: ${detail}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres ELIMINAR este cupo?")) return;
        setLoading(true);
        try {
            await api.eliminarTurno(turno.id); // 👈 CAMBIO
            toast.success("Cupo eliminado con éxito.");
            onUpdate();
        } catch (error) {
            toast.error("Error al eliminar el cupo.");
        } finally {
            setLoading(false);
        }
    };

    const socioInfo = turno.socio_info ? `Asignado a: ${turno.socio_info.username}` : 'Cupo libre';

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Editar Turno</CardTitle>
                <p className="text-sm text-muted-foreground">{socioInfo}</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="space-y-2">
                        <Label htmlFor="hora_inicio">Nueva Fecha y Hora de Inicio</Label>
                        <Input
                            id="hora_inicio"
                            type="datetime-local"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            min={moment().format('YYYY-MM-DDTHH:mm')}
                            required
                            disabled={turno.estado === 'CONFIRMADO'}
                        />
                        {turno.estado === 'CONFIRMADO' && (
                            <p className="text-xs text-red-500">
                                No se puede editar la hora de turnos CONFIRMADOS.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado del Turno</Label>
                        <Select value={estado} onValueChange={setEstado} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {ESTADOS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Eliminar Cupo
                        </Button>
                        <div className="flex gap-3">
                             <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="bg-cyan-600 hover:bg-cyan-700"
                            >
                                {loading ? 'Actualizando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TurnosEdit;