// src/components/CustomAlert.jsx
import { useState, useEffect } from 'react';
import './CustomAlert.css';

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  type, 
  onClose,
  onConfirm,
  showCancel = false,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) {
  const [isClosing, setIsClosing] = useState(false);

  // ✅ DEBUG: Ver cuando el componente recibe props
  useEffect(() => {

  }, [visible, message]);

  useEffect(() => {
    if (visible && !showCancel) {
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [visible, showCancel]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onConfirm) onConfirm();
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!visible && !isClosing) {
    return null;
  }


  const typeColors = {
    success: '#19d44c',
    error: '#ff4444',
    warning: '#ffa500',
    info: '#2196F3',
    confirm: '#2196F3'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?'
  };

  const color = typeColors[type] || typeColors.success;
  const icon = typeIcons[type] || typeIcons.success;

  return (
    <div 
      className={`alert-overlay ${isClosing ? 'closing' : ''}`}
      onClick={showCancel ? undefined : handleClose}
    >
      <div 
        className={`alert-box ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="alert-icon"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <h2 className="alert-title" style={{ color }}>{title}</h2>
        <p className="alert-message">{message}</p>
        
        <div className={`alert-buttons ${showCancel ? 'two-buttons' : ''}`}>
          {showCancel && (
            <button 
              onClick={handleClose} 
              className="alert-button alert-button-cancel"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm} 
            className="alert-button alert-button-confirm"
            style={{ backgroundColor: color }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}