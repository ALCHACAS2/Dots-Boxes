// src/components/Lobby.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { saveGameState, getSavedGameState, clearSavedGameState, isGameDataMatch } from "../utils/cookieUtils";
import "./Lobby.css";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [gridSize, setGridSize] = useState(3);
  const [players, setPlayers] = useState([]);
  const [roomGridSize, setRoomGridSize] = useState(null);
  const [isRejoining, setIsRejoining] = useState(false);

  const navigate = useNavigate();
  const socket = useSocket();

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const savedGame = getSavedGameState();
    if (savedGame) {
      console.log("Datos de juego guardados encontrados:", savedGame);
      setPlayerName(savedGame.playerName || "");
      setRoomCode(savedGame.roomCode || "");
      setGridSize(savedGame.gridSize || 3);
      
      // Intentar reconectar automáticamente si hay datos guardados completos
      if (savedGame.playerName && savedGame.roomCode) {
        setIsRejoining(true);
        console.log("Intentando reconectar a la partida guardada...");
        socket.emit("rejoinRoom", {
          roomCode: savedGame.roomCode,
          name: savedGame.playerName,
          gridSize: savedGame.gridSize
        });
      }
    }
  }, [socket]);

  useEffect(() => {
    // Escuchar cuando se actualiza la lista de jugadores
    socket.on("playersUpdate", (roomData) => {
      console.log("Datos de sala actualizados:", roomData);
      setPlayers(roomData.players || []);
      setRoomGridSize(roomData.gridSize);
      setIsRejoining(false);
      
      // Guardar datos actualizados en cookies
      if (playerName && roomCode) {
        saveGameState({
          playerName,
          roomCode,
          gridSize: roomData.gridSize || gridSize,
          players: roomData.players || [],
          timestamp: Date.now()
        });
      }
    });

    socket.on("startGame", (gameData) => {
      console.log("Recibido startGame", gameData);
      
      // Actualizar datos guardados con información del juego
      const gameState = {
        playerName,
        roomCode,
        gridSize: gameData.gridSize,
        players: gameData.players,
        gameStarted: true,
        timestamp: Date.now()
      };
      saveGameState(gameState);
      
      navigate("/game", {
        state: {
          playerName,
          roomCode,
          players: gameData.players,
          gridSize: gameData.gridSize,
        },
      });
    });

    socket.on("roomFull", () => {
      alert("La sala está llena.");
      setIsRejoining(false);
    });

    socket.on("roomNotFound", () => {
      console.log("Sala no encontrada, limpiando datos guardados");
      clearSavedGameState();
      setIsRejoining(false);
    });

    socket.on("gameInProgress", (gameData) => {
      console.log("Juego en progreso, redirigiendo...", gameData);
      navigate("/game", {
        state: {
          playerName,
          roomCode,
          players: gameData.players,
          gridSize: gameData.gridSize,
        },
      });
    });

    return () => {
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("playersUpdate");
      socket.off("roomNotFound");
      socket.off("gameInProgress");
    };
  }, [navigate, playerName, roomCode, gridSize]);

  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    
    console.log("Intentando unirse a sala:", { roomCode, playerName, gridSize });
    
    // Guardar datos básicos antes de unirse
    saveGameState({
      playerName,
      roomCode,
      gridSize,
      timestamp: Date.now()
    });
    
    socket.emit("joinRoom", { roomCode, name: playerName, gridSize });
  };

  const handleClearSavedGame = () => {
    clearSavedGameState();
    setPlayerName("");
    setRoomCode("");
    setGridSize(3);
    setPlayers([]);
    setRoomGridSize(null);
    console.log("Datos de juego guardados eliminados");
  };

  // Verificar si hay datos guardados para mostrar botón de limpiar
  const savedGame = getSavedGameState();
  const hasValidSavedData = savedGame && savedGame.playerName && savedGame.roomCode;

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h2 className="lobby-title">Dots and Boxes</h2>
        
        {isRejoining && (
          <div className="reconnecting-message">
            <p>Reconectando a la partida guardada...</p>
          </div>
        )}

        {hasValidSavedData && !isRejoining && (
          <div className="saved-game-notice">
            <p>Se encontró una partida guardada</p>
            <button 
              onClick={handleClearSavedGame}
              className="clear-saved-button"
            >
              Limpiar datos guardados
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="playerName">Nombre del jugador:</label>
          <input
            id="playerName"
            type="text"
            placeholder="Ingresa tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
            disabled={isRejoining}
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomCode">Código de sala:</label>
          <input
            id="roomCode"
            type="text"
            placeholder="Código de la sala"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="input-field"
            disabled={isRejoining}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gridSize">Tamaño del tablero:</label>
          <select
            id="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="select-field"
            disabled={players.length > 0 || isRejoining} // Deshabilitar si ya hay jugadores en la sala o si está reconectando
          >
            <option value={3}>3x3 (9 cajas)</option>
            <option value={4}>4x4 (16 cajas)</option>
            <option value={5}>5x5 (25 cajas)</option>
            <option value={6}>6x6 (36 cajas)</option>
            <option value={7}>7x7 (49 cajas)</option>
            <option value={8}>8x8 (64 cajas)</option>
            <option value={10}>10x10 (100 cajas)</option>
          </select>
          {players.length > 0 && roomGridSize && (
            <p className="grid-size-info">
              Tamaño establecido: {roomGridSize}x{roomGridSize}
            </p>
          )}
        </div>

        <button
          onClick={handleJoin}
          className="join-button"
          disabled={!playerName || !roomCode || isRejoining}
        >
          {isRejoining ? "Reconectando..." : "Unirse a la sala"}
        </button>

        {players.length > 0 && (
          <div className="players-section">
            <h3>Jugadores en la sala ({players.length}/2):</h3>
            <div className="players-list">
              {players.map((player, index) => (
                <div key={index} className="player-item">
                  <span className="player-name">{player.name}</span>
                  {player.name === playerName && <span className="you-badge">(tú)</span>}
                </div>
              ))}
            </div>
            {players.length === 1 && (
              <p className="waiting-message">Esperando al segundo jugador...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;

/* src/components/Lobby.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import "./Lobby.css";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    // Escuchar cuando se actualiza la lista de jugadores
    socket.on("playersUpdate", (updatedPlayers) => {
      console.log("Jugadores actualizados:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("startGame", (playersArray) => {
      console.log("Recibido startGame", playersArray);
      navigate("/game", {
        state: {
          playerName,
          roomCode,
          players: playersArray, // El servidor envía directamente el array de jugadores
        },
      });
    });

    socket.on("roomFull", () => {
      alert("La sala está llena.");
    });

    return () => {
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("playersUpdate");
    };
  }, [navigate, playerName, roomCode, players]);

  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    console.log("Intentando unirse a sala:", { roomCode, playerName });
    socket.emit("joinRoom", { roomCode, name: playerName });
  };

  return (
    <div>
      <h2>Lobby</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Código de sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={handleJoin}>Unirse</button>

      {players.length > 0 && (
        <div>
          <h3>Jugadores en la sala:</h3>
          {players.map((player, index) => (
            <div key={index}>{player.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lobby;
*/