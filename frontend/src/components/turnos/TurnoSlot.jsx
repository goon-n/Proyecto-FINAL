//src/components/turnos/TurnoSlot.jsx
import React from 'react';
import axios from 'axios';
import moment from 'moment';

const API_URL = '/api/turnos/';

const TurnoSlot = ({ turno, user, onActionSuccess }) => {
    const hora = moment(turno.hora_inicio).format('HH:mm');
    // Chequea si el ID del socio del turno coincide con el ID del usuario logeado
    const isReservedByMe = user && turno.socio === user.id;

    const handleAction = async (action) => {
        if (!user) {
            alert("Debes iniciar sesión para realizar esta acción.");
            return;
        }

        try {
            const endpoint = `${API_URL}${turno.id}/${action}/`;
            // Asegúrate de que Axios esté configurado para enviar el token/cookies
            await axios.post(endpoint, {});
            alert(`Acción ${action} realizada con éxito.`);
            onActionSuccess(); 
        } catch (error) {
            const detail = error.response?.data?.detail || `Error al ${action} el turno.`;
            alert(`Error: ${detail}`);
            onActionSuccess(); // Forzar refresh para limpiar el estado si el backend canceló el turno (ej. por 24h)
        }
    };

    let buttonText = '';
    let buttonAction = null;
    let slotClass = 'slot-available';
    let smallNote = '';

    if (turno.estado === 'SOLICITUD') {
        buttonText = 'Reservar';
        buttonAction = () => handleAction('reservar');
    } else if (isReservedByMe) {
        // Reservado por mí, pendiente de confirmación
        if (turno.estado === 'RESERVADO') {
            buttonText = 'Confirmar';
            buttonAction = () => handleAction('confirmar');
            slotClass = 'slot-reserved-pending';
            smallNote = '¡Pendiente de confirmación!';
        } 
        // Confirmado por mí
        else if (turno.estado === 'CONFIRMADO') {
            buttonText = 'Cancelar';
            buttonAction = () => handleAction('cancelar');
            slotClass = 'slot-confirmed';
            smallNote = 'Confirmado';
        }
    } else if (turno.estado === 'RESERVADO' || turno.estado === 'CONFIRMADO') {
        // Ocupado por otro usuario
        buttonText = 'Ocupado';
        slotClass = 'slot-occupied';
    } else {
        // Otros estados (CANCELADO/FINALIZADO)
        return null;
    }
    
    // Si el turno está ocupado por otro, no mostramos botón de acción, solo el estado.
    const showButton = buttonAction && (!turno.socio || isReservedByMe);

    return (
        <div className={`turno-slot ${slotClass}`}>
            <span>{hora}hs</span>
            {showButton ? (
                <button onClick={buttonAction} disabled={!user}>
                    {buttonText}
                </button>
            ) : (
                <span className="status-text">{buttonText}</span>
            )}
            {smallNote && <small>{smallNote}</small>}
        </div>
    );
};

export default TurnoSlot;