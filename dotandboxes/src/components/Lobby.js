import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import {
  Layout,
  Card,
  Button,
  Input,
  Select,
  Header,
  GameGrid,
  PlayerList,
  Alert
} from "./ui";
import "./Lobby.css";
import "./LobbyExtras.css";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [gridSize, setGridSize] = useState(3);
  const [gameType, setGameType] = useState('dots-boxes');
  const [players, setPlayers] = useState([]);
  const [roomGridSize, setRoomGridSize] = useState(null);
  const [roomGameType, setRoomGameType] = useState(null); const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [customGridSize, setCustomGridSize] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [alert, setAlert] = useState(null);

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
    }); socket.on("startGame", (data) => {
      console.log("Recibido startGame:", data);

      // Navegar al juego correspondiente según el tipo
      const gameRoute = data.gameType === 'tic-tac-toe' ? '/tic-tac-toe' : '/dotsandboxes';

      navigate(gameRoute, {
        state: {
          playerName,
          roomCode,
          players: data.players,
          gridSize: data.gridSize,
          gameType: data.gameType
        },
      });
    }); socket.on("roomFull", () => {
      setAlert({
        type: 'error',
        title: 'Error al unirse',
        message: 'La sala está llena o el nombre ya está en uso.'
      });
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
        setAlert({
          type: 'warning',
          title: 'Tamaño inválido',
          message: 'El tamaño personalizado debe ser un número entre 2 y 10.'
        });
        return;
      }
    }

    if (!playerName.trim() || !roomCode.trim()) {
      setAlert({
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Por favor, completa todos los campos.'
      });
      return;
    }

    console.log("Intentando unirse a sala:", { roomCode, playerName, gameType, gridSize });
    setIsWaitingForPlayers(true); const finalGridSize = gameType === 'tic-tac-toe' ? 3 :
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
    setAlert(null);
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
  };  // Lista de juegos para el grid 3x3
  const gridGames = [
    { value: 'dots-boxes', label: 'Dots & Boxes', icon: '⚪' },
    { value: 'tic-tac-toe', label: '3 en Línea', icon: '❌' },
    { value: 'test-dotsbox', label: 'Pruebas D&B', icon: '🔧' },
    { value: 'coming-soon-1', label: 'Próximamente', icon: '🎲' },
    { value: 'coming-soon-2', label: 'Próximamente', icon: '🧩' },
    { value: 'coming-soon-3', label: 'Próximamente', icon: '🕹️' },
    { value: 'coming-soon-4', label: 'Próximamente', icon: '�' },
    { value: 'coming-soon-5', label: 'Próximamente', icon: '🃏' },
    { value: 'coming-soon-6', label: 'Próximamente', icon: '🧠' },
  ];
  const handleGameSelect = (game) => {
    if (game.value === 'dots-boxes' || game.value === 'tic-tac-toe') {
      setSelectedGame(game.value);
      setGameType(game.value);
    } else if (game.value === 'test-dotsbox') {
      navigate('/test-dotsbox');
    }
  };

  // Si no se ha seleccionado un juego, mostrar el grid 3x3
  if (!selectedGame) {
    return (
      <Layout variant="gaming">
        <Card size="extra-large" variant="glass">
          <Header
            title="Elige un juego"
            icon="🎮"
            variant="gaming"
            size="large"
          />
          <GameGrid
            games={gridGames}
            onGameSelect={handleGameSelect}
            variant="gaming"
            size="medium"
            columns={3}
          />
        </Card>
      </Layout>
    );
  }
  return (
    <Layout variant="default">
      <Card size="large" variant="glass">        <Header
        title="Juegos Multijugador"
        icon="🎮"
        variant="gradient"
        size="large"
      >
        <Button
          variant="minimal"
          size="small"
          onClick={() => {
            setSelectedGame(null);
            setRoomGameType(null);
            setRoomGridSize(null);
            setGridSize(3);
            setCustomGridSize("");
            setAlert(null);
          }}
          icon="←"
        >
          Ir atrás
        </Button>
      </Header>

        {alert && (
          <Alert
            variant={alert.type}
            title={alert.title}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        {!isWaitingForPlayers ? (
          <div className="lobby-form">
            <Input
              label="Tu nombre:"
              placeholder="Ingresa tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              variant="glass"
              icon="👤"
            />

            <Input
              label="Código de sala:"
              placeholder="Ingresa el código de sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={10}
              variant="glass"
              icon="🔑"
            />

            {/* Selector de tamaño solo para Dots & Boxes */}
            {(roomGameType === null ? gameType : roomGameType) === 'dots-boxes' && (
              <div className="game-settings">
                <Select
                  label="Tamaño del tablero:"
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
                  variant="glass"
                  icon="📐"
                >
                  {gridSizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                {gridSize === "custom" && roomGridSize === null && (
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    placeholder="Tamaño personalizado (2 a 10)"
                    value={customGridSize}
                    onChange={(e) => setCustomGridSize(e.target.value)}
                    variant="glass"
                    helper="Introduce un número entre 2 y 10"
                  />
                )}

                <div className="grid-size-info">
                  {roomGridSize !== null ? (
                    <p>✅ El tamaño del tablero ya fue establecido: {roomGridSize}x{roomGridSize}</p>
                  ) : (
                    <p>🎯 Como primer jugador, puedes elegir el tamaño del tablero</p>
                  )}
                </div>
              </div>
            )}

            {/* Descripción solo para Tic Tac Toe */}
            {(roomGameType === null ? gameType : roomGameType) === 'tic-tac-toe' && (
              <Card variant="transparent" size="small" className="game-description">
                <p>🎯 <strong>3 en Línea (Tic-Tac-Toe)</strong></p>
                <p>¡Consigue tres en línea para ganar! Tablero clásico 3x3.</p>
              </Card>
            )}

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleJoin}
              disabled={!playerName.trim() || !roomCode.trim()}
              loading={false}
              icon="🚀"
            >
              Unirse a la sala
            </Button>
          </div>
        ) : (
          <div className="waiting-section">
            <Header
              title={`Sala: ${roomCode}`}
              subtitle={`${getGameTypeLabel(roomGameType || gameType)} - ${players.length}/2 jugadores`}
              variant="primary"
              size="medium"
            />

            {(roomGameType || gameType) === 'dots-boxes' && (
              <Card variant="transparent" size="small" className="game-info">
                <p><strong>📐 Tamaño del tablero:</strong> {roomGridSize || gridSize}x{roomGridSize || gridSize}</p>
              </Card>
            )}

            <PlayerList
              players={players}
              currentPlayer={playerName}
              maxPlayers={2}
              variant="glass"
              size="medium"
              showWaiting={true}
            />

            <Button
              variant="danger"
              size="medium"
              fullWidth
              onClick={handleBack}
              icon="👈"
              style={{ marginTop: '1.5rem' }}
            >
              Salir de la sala
            </Button>
          </div>
        )}
      </Card>
    </Layout>
  );
}

export default Lobby;