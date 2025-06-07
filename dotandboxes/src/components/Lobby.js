/*import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import "./Lobby.css";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [gridSize, setGridSize] = useState(3);
  const [players, setPlayers] = useState([]);
  const [roomGridSize, setRoomGridSize] = useState(null);
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [customGridSize, setCustomGridSize] = useState("");


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

      // Si hay jugadores en la sala, mostrar mensaje de espera
      if (data.players && data.players.length > 0) {
        setIsWaitingForPlayers(true);
      }
    });

    socket.on("startGame", (data) => {
      console.log("Recibido startGame:", data);
      navigate("/game", {
        state: {
          playerName,
          roomCode,
          players: data.players,
          gridSize: data.gridSize
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
    if (gridSize === "custom") {
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

    console.log("Intentando unirse a sala:", { roomCode, playerName, gridSize });
    setIsWaitingForPlayers(true);

    socket.emit("joinRoom", {
      roomCode: roomCode.trim(),
      name: playerName.trim(),
      gridSize: gridSize === "custom" ? parseInt(customGridSize) : parseInt(gridSize)
    });

  };

  const handleBack = () => {
    setIsWaitingForPlayers(false);
    setPlayers([]);
    setRoomGridSize(null);
  };

  const gridSizeOptions = [
    { value: 2, label: "2x2 (Fácil)" },
    { value: 3, label: "3x3 (Normal)" },
    { value: 4, label: "4x4 (Difícil)" },
    { value: 5, label: "5x5 (Experto)" },
    { value: "custom", label: "Personalizado" }
  ];

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">Dots & Boxes</h1>

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
                  El tamaño del tablero ya fue establecido por el primer jugador: {roomGridSize}x{roomGridSize}
                </div>
              )}
              {roomGridSize === null && (
                <div className="grid-size-info">
                  Como primer jugador, puedes elegir el tamaño del tablero
                </div>
              )}
            </div>

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

            <div className="game-info">
              <p><strong>Tamaño del tablero:</strong> {roomGridSize || gridSize}x{roomGridSize || gridSize}</p>
              <p><strong>Jugadores:</strong> {players.length}/2</p>
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

export default Lobby;*///descomentar para usar el Lobby antiguo
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

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">🎮 Juegos Multijugador</h1>

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

            <div className="form-group">
              <label htmlFor="gameType">Tipo de juego:</label>
              <div className="game-type-selector">
                {gameTypeOptions.map(option => (
                  <div
                    key={option.value}
                    className={`game-type-option ${(roomGameType !== null ? roomGameType : gameType) === option.value ? 'selected' : ''
                      } ${roomGameType !== null ? 'disabled' : ''}`}
                    onClick={() => {
                      if (roomGameType === null) {
                        setGameType(option.value);
                        // Reset grid size when changing game type
                        if (option.value === 'tic-tac-toe') {
                          setGridSize(3);
                        } else {
                          setGridSize(3);
                        }
                      }
                    }}
                  >
                    <span className="game-icon">{option.icon}</span>
                    <span className="game-label">{option.label}</span>
                  </div>
                ))}
              </div>

              {roomGameType !== null && (
                <div className="game-type-info">
                  El tipo de juego ya fue establecido: {getGameTypeLabel(roomGameType)}
                </div>
              )}
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