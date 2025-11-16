// src/hooks/useCSRF.js

/**
 * Hook para obtener el token CSRF de las cookies
 * 
 * @returns {object} Objeto con la función getCSRFToken
 */
export const useCSRF = () => {
  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  return { getCSRFToken };
};