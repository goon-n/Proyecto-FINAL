// src/context/AlertContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de AlertProvider');
  }
  return context;
};

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showAlert = (message, title = 'Notificación', type = 'success') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type
    });
  };

  const showSuccess = (message, title = '¡Éxito!') => {
    showAlert(message, title, 'success');
  };

  const showError = (message, title = 'Error') => {
    showAlert(message, title, 'error');
  };

  const showWarning = (message, title = 'Advertencia') => {
    showAlert(message, title, 'warning');
  };

  const showInfo = (message, title = 'Información') => {
    showAlert(message, title, 'info');
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({
      ...prev,
      visible: false
    }));
  };

  return (
    <AlertContext.Provider value={{ 
      showAlert, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo,
      closeAlert 
    }}>
      {children}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
}