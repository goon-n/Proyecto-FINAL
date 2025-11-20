// src/components/CustomAlert.jsx
import { useState, useEffect } from 'react';
import '../components/CustomAlert.css';

export default function CustomAlert({ visible, title, message, type, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!visible && !isClosing) return null;

  const typeColors = {
    success: '#19d44c',
    error: '#ff4444',
    warning: '#ffa500',
    info: '#2196F3'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const color = typeColors[type] || typeColors.success;
  const icon = typeIcons[type] || typeIcons.success;

  return (
    <div 
      className={`alert-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
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
        <button 
          onClick={handleClose} 
          className="alert-button"
          style={{ backgroundColor: color }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}