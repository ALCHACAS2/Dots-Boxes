import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import "./Lobby.css";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [gridSize, setGridSize] = useState(3);
  const [gameType, setGameType] = useState('dots-boxes');
  const [players, setPlayers] = useState([]);
  const [roomGridSize, setRoomGridSize] = useState(null);
  const [roomGameType, setRoomGameType] = useState(null);
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [customGridSize, setCustomGridSize] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    socket.on("playersUpdate", (data) => {
      console.log("Jugadores actualizados:", data);
      setPlayers(data.players || []);

      // Si recibimos información del tamaño de cuadrícula de la sala
      if (data.gridSize !== undefined) {
        setRoomGridSize(data.gridSize);
      }

      // Si recibimos información del tipo de juego de la sala
      if (data.gameType !== undefined) {
        setRoomGameType(data.gameType);
      }

      // Si hay jugadores en la sala, mostrar mensaje de espera
      if (data.players && data.players.length > 0) {
        setIsWaitingForPlayers(true);
      }
    });

    socket.on("startGame", (data) => {
      console.log("Recibido startGame:", data);

      // Navegar al juego correspondiente según el tipo
      const gameRoute = data.gameType === 'tic-tac-toe' ? '/tic-tac-toe' : '/game';

      navigate(gameRoute, {
        state: {
          playerName,
          roomCode,
          players: data.players,
          gridSize: data.gridSize,
          gameType: data.gameType
        },
      });
    });

    socket.on("roomFull", () => {
      alert("La sala está llena o el nombre ya está en uso.");
      setIsWaitingForPlayers(false);
    });

    return () => {
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("playersUpdate");
    };
  }, [socket, navigate, playerName, roomCode]);

  const handleJoin = () => {
    // Validación para tamaño personalizado en Dots & Boxes
    if (gameType === 'dots-boxes' && gridSize === "custom") {
      const size = parseInt(customGridSize);
      if (isNaN(size) || size < 2 || size > 10) {
        alert("El tamaño personalizado debe ser un número entre 2 y 10.");
        return;
      }
    }

    if (!playerName.trim() || !roomCode.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    console.log("Intentando unirse a sala:", { roomCode, playerName, gameType, gridSize });
    setIsWaitingForPlayers(true);

    const finalGridSize = gameType === 'tic-tac-toe' ? 3 :
      (gridSize === "custom" ? parseInt(customGridSize) : parseInt(gridSize));

    socket.emit("joinRoom", {
      roomCode: roomCode.trim(),
      name: playerName.trim(),
      gridSize: finalGridSize,
      gameType: gameType
    });
  };

  const handleBack = () => {
    setIsWaitingForPlayers(false);
    setPlayers([]);
    setRoomGridSize(null);
    setRoomGameType(null);
  };

  const gameTypeOptions = [
    { value: 'dots-boxes', label: 'Dots & Boxes', icon: '⚪' },
    { value: 'tic-tac-toe', label: '3 en Línea', icon: '❌' }
  ];

  const gridSizeOptions = [
    { value: 2, label: "2x2 (Fácil)" },
    { value: 3, label: "3x3 (Normal)" },
    { value: 4, label: "4x4 (Difícil)" },
    { value: 5, label: "5x5 (Experto)" },
    { value: "custom", label: "Personalizado" }
  ];

  const getGameTypeLabel = (type) => {
    const gameOption = gameTypeOptions.find(option => option.value === type);
    return gameOption ? gameOption.label : type;
  };

  // Lista de juegos para el grid 3x3
  const gridGames = [
    { value: 'dots-boxes', label: 'Dots & Boxes', icon: '⚪' },
    { value: 'tic-tac-toe', label: '3 en Línea', icon: '❌' },
    { value: 'coming-soon-1', label: 'Próximamente', icon: '🎲' },
    { value: 'coming-soon-2', label: 'Próximamente', icon: '🧩' },
    { value: 'coming-soon-3', label: 'Próximamente', icon: '🕹️' },
    { value: 'coming-soon-4', label: 'Próximamente', icon: '🎮' },
    { value: 'coming-soon-5', label: 'Próximamente', icon: '🃏' },
    { value: 'coming-soon-6', label: 'Próximamente', icon: '🧠' },
    { value: 'coming-soon-7', label: 'Próximamente', icon: '🏆' },
  ];

  // Si no se ha seleccionado un juego, mostrar el grid 3x3
  if (!selectedGame) {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <h1 className="lobby-title">🎮 Elige un juego</h1>
          <div className="game-grid-3x3">
            {gridGames.map((game, idx) => (
              <div
                key={game.value + idx}
                className={`game-grid-cell${game.value === 'dots-boxes' || game.value === 'tic-tac-toe' ? ' selectable' : ' disabled'}`}
                style={{
                  cursor: game.value === 'dots-boxes' || game.value === 'tic-tac-toe' ? 'pointer' : 'not-allowed',
                  opacity: game.value === 'dots-boxes' || game.value === 'tic-tac-toe' ? 1 : 0.5,
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  margin: '8px',
                  padding: '24px',
                  fontSize: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f9f9f9',
                  minWidth: '100px',
                  minHeight: '100px',
                  boxShadow: '0 2px 8px #0001',
                }}
                onClick={() => {
                  if (game.value === 'dots-boxes' || game.value === 'tic-tac-toe') {
                    setSelectedGame(game.value);
                    setGameType(game.value);
                  }
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{game.icon}</span>
                <span style={{ marginTop: '10px', fontWeight: 'bold' }}>{game.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">🎮 Juegos Multijugador</h1>
        <button
          className="back-button"
          style={{ marginBottom: 16, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => {
            setSelectedGame(null);
            setRoomGameType(null);
            setRoomGridSize(null);
            setGridSize(3);
            setCustomGridSize("");
          }}
        >
          ← Ir atrás
        </button>
        {!isWaitingForPlayers ? (
          <>
            <div className="form-group">
              <label htmlFor="playerName">Tu nombre:</label>
              <input
                id="playerName"
                type="text"
                className="input-field"
                placeholder="Ingresa tu nombre"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomCode">Código de sala:</label>
              <input
                id="roomCode"
                type="text"
                className="input-field"
                placeholder="Ingresa el código de sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={10}
              />
            </div>

            {(roomGameType === null ? gameType : roomGameType) === 'dots-boxes' && (
              <div className="form-group">
                <label htmlFor="gridSize">Tamaño del tablero:</label>
                <select
                  id="gridSize"
                  className="select-field"
                  value={roomGridSize !== null ? roomGridSize : gridSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "custom") {
                      setGridSize("custom");
                    } else {
                      setGridSize(parseInt(value));
                      setCustomGridSize("");
                    }
                  }}
                  disabled={roomGridSize !== null}
                >
                  {gridSizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {gridSize === "custom" && roomGridSize === null && (
                  <input
                    type="number"
                    min="2"
                    max="10"
                    className="input-field"
                    placeholder="Tamaño personalizado (2 a 10)"
                    value={customGridSize}
                    onChange={(e) => setCustomGridSize(e.target.value)}
                  />
                )}

                {roomGridSize !== null && (
                  <div className="grid-size-info">
                    El tamaño del tablero ya fue establecido: {roomGridSize}x{roomGridSize}
                  </div>
                )}
                {roomGridSize === null && (
                  <div className="grid-size-info">
                    Como primer jugador, puedes elegir el tamaño del tablero
                  </div>
                )}
              </div>
            )}

            {(roomGameType === null ? gameType : roomGameType) === 'tic-tac-toe' && (
              <div className="form-group">
                <div className="game-description">
                  <p>🎯 <strong>3 en Línea (Tic-Tac-Toe)</strong></p>
                  <p>Tablero fijo de 3x3. ¡Consigue 3 en línea para ganar!</p>
                </div>
              </div>
            )}

            <button
              className="join-button"
              onClick={handleJoin}
              disabled={!playerName.trim() || !roomCode.trim()}
            >
              Unirse a la sala
            </button>
          </>
        ) : (
          <div className="players-section">
            <h3>Sala: {roomCode}</h3>

            <div className="game-info">
              <p><strong>Juego:</strong> {getGameTypeLabel(roomGameType || gameType)}</p>
              {(roomGameType || gameType) === 'dots-boxes' && (
                <p><strong>Tamaño del tablero:</strong> {roomGridSize || gridSize}x{roomGridSize || gridSize}</p>
              )}
              <p><strong>Jugadores:</strong> {players.length}/2</p>
            </div>

            <div className="players-list">
              {players.map((player, index) => (
                <div key={index} className="player-item">
                  <span className="player-name">{player.name}</span>
                  {player.name === playerName && (
                    <span className="you-badge">Tú</span>
                  )}
                </div>
              ))}
            </div>

            {players.length < 2 && (
              <div className="waiting-message">
                Esperando a que se una otro jugador...
              </div>
            )}

            <button
              className="join-button"
              onClick={handleBack}
              style={{ marginTop: '15px', background: '#dc3545' }}
            >
              Salir de la sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;