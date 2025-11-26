// src/hooks/useCustomAlert.jsx
import { useState } from 'react';
import CustomAlert from '../components/CustomAlert';

export const useCustomAlert = () => {
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    showCancel: false,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onClose: null
  });

  // ✅ CERRAR ALERTA
  const closeAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  // ✅ FUNCIÓN PARA MOSTRAR ALERTA SIMPLE
  const showAlert = ({ type = 'info', title = 'Turnos', message, onClose = null }) => {
    
    setAlert({
      visible: true,
      type,
      title,
      message,
      showCancel: false,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: null,
      onClose: onClose || closeAlert
    });
  };

  // ✅ FUNCIÓN PARA MOSTRAR CONFIRMACIÓN
  const showConfirm = ({ 
    type = 'confirm', 
    title = 'Turnos', 
    message, 
    confirmText = 'Aceptar', 
    cancelText = 'Cancelar' 
  }) => {
    
    return new Promise((resolve) => {
      setAlert({
        visible: true,
        type,
        title,
        message,
        showCancel: true,
        confirmText,
        cancelText,
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onClose: () => {
          closeAlert();
          resolve(false);
        }
      });
    });
  };

  // ✅ ATAJOS PARA TIPOS ESPECÍFICOS
  const showSuccess = (message, title = 'Turnos') => {
    return new Promise((resolve) => {
      setAlert({
        visible: true,
        type: 'success',
        title,
        message,
        showCancel: false,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        onConfirm: null,
        onClose: () => {
          closeAlert();
          resolve(true);
        }
      });
      // Auto-cerrar después de 3 segundos si no se interactúa
      setTimeout(() => {
        closeAlert();
        resolve(true);
      }, 3000);
    });
  };

  const showError = (message, title = 'Turnos') => {
    return new Promise((resolve) => {
      setAlert({
        visible: true,
        type: 'error',
        title,
        message,
        showCancel: false,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        onConfirm: null,
        onClose: () => {
          closeAlert();
          resolve(false);
        }
      });
    });
  };

  const showWarning = (message, title = 'Turnos') => {
    return new Promise((resolve) => {
      setAlert({
        visible: true,
        type: 'warning',
        title,
        message,
        showCancel: false,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        onConfirm: null,
        onClose: () => {
          closeAlert();
          resolve(false);
        }
      });
    });
  };

  const showInfo = (message, title = 'Turnos') => {
    return new Promise((resolve) => {
      setAlert({
        visible: true,
        type: 'info',
        title,
        message,
        showCancel: false,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        onConfirm: null,
        onClose: () => {
          closeAlert();
          resolve(true);
        }
      });
      // Auto-cerrar después de 3 segundos si no se interactúa
      setTimeout(() => {
        closeAlert();
        resolve(true);
      }, 3000);
    });
  };

  // ✅ COMPONENTE DE ALERTA
  const AlertComponent = () => {
    return <CustomAlert {...alert} />;
  };

  return {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertComponent
  };
};
