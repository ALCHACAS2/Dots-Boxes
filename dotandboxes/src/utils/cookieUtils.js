// src/utils/cookieUtils.js

// Función para establecer una cookie
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
};

// Función para obtener una cookie
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
};

// Función para eliminar una cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Función para guardar el estado del juego
export const saveGameState = (gameState) => {
  setCookie('dotsAndBoxesGame', gameState, 1); // Guardar por 1 día
};

// Función para obtener el estado del juego guardado
export const getSavedGameState = () => {
  return getCookie('dotsAndBoxesGame');
};

// Función para limpiar el estado del juego guardado
export const clearSavedGameState = () => {
  deleteCookie('dotsAndBoxesGame');
};

// Función para verificar si los datos de la partida coinciden
export const isGameDataMatch = (savedData, currentData) => {
  if (!savedData || !currentData) return false;
  
  return (
    savedData.playerName === currentData.playerName &&
    savedData.roomCode === currentData.roomCode &&
    savedData.gridSize === currentData.gridSize
  );
};