// src/components/GameBoard.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useVoiceChat } from "../hooks/useVoice";

import "./GameBoard.css";

const GameBoard = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [], gridSize: initialGridSize = 3 } = location.state || {};
    const socket = useSocket(); // ✅ primero obtenés el socket
    
    const {
        micEnabled,
        audioEnabled,
        toggleMic,
        toggleAudio,
        isConnecting,
        connectionState,
        forceEnableControls,
        reconnectVoice
    } = useVoiceChat({
        socket,
        roomCode,
        isInitiator: players[0]?.name === playerName
    });


    console.log("Location state:", location.state);
    console.log("Players:", players);
    console.log("Grid Size:", initialGridSize);

    const [GRID_SIZE, setGridSize] = useState(initialGridSize);
    const [horizontalLines, setHorizontalLines] = useState([]);
    const [verticalLines, setVerticalLines] = useState([]);
    const [boxes, setBoxes] = useState([]);    const [turnIndex, setTurnIndex] = useState(0);
    const [scores, setScores] = useState({});

    // Funciones helper para manejo de jugadores
    const getPlayerNumber = (playerName) => {
        if (!players || players.length < 2) return null;
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex + 1; // Convertir índice a número de jugador (1 o 2)
    };

    const getCurrentPlayerNumber = () => {
        const currentPlayerName = players[turnIndex]?.name;
        return getPlayerNumber(currentPlayerName);
    };

    // Inicializar arrays basados en el tamaño de cuadrícula
    useEffect(() => {
        const size = initialGridSize || 3;
        setGridSize(size);

        setHorizontalLines(Array(size + 1).fill(null).map(() => Array(size).fill(false)));
        setVerticalLines(Array(size).fill(null).map(() => Array(size + 1).fill(false)));
        setBoxes(Array(size).fill(null).map(() => Array(size).fill(null)));
    }, [initialGridSize]);    useEffect(() => {
        if (players.length === 2) {
            // Inicializar scores con ambos jugadores
            const initialScores = {};
            players.forEach(player => {
                initialScores[player.name] = 0;
            });
            setScores(initialScores);
        }
    }, [players, playerName]);

    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;

    useEffect(() => {
        socket.on("opponent_move", (moveData) => {
            console.log("Movimiento del oponente recibido:", moveData);
            // Aplicar directamente el estado recibido del servidor
            if (moveData.horizontalLines) setHorizontalLines(moveData.horizontalLines);
            if (moveData.verticalLines) setVerticalLines(moveData.verticalLines);
            if (moveData.boxes) setBoxes(moveData.boxes);
            if (moveData.scores) setScores(moveData.scores);
            if (moveData.newTurnIndex !== undefined) setTurnIndex(moveData.newTurnIndex);
        });

        socket.on("game_state", (newGameState) => {
            console.log("Estado del juego recibido:", newGameState);
            if (newGameState) {
                if (newGameState.gridSize && newGameState.gridSize !== GRID_SIZE) {
                    setGridSize(newGameState.gridSize);
                }
                setTurnIndex(newGameState.turnIndex || 0);
                if (newGameState.scores) setScores(newGameState.scores);
                if (newGameState.horizontalLines) setHorizontalLines(newGameState.horizontalLines);
                if (newGameState.verticalLines) setVerticalLines(newGameState.verticalLines);
                if (newGameState.boxes) setBoxes(newGameState.boxes);
            }
        });

        return () => {
            socket.off("opponent_move");
            socket.off("game_state");
        };
    }, [socket, GRID_SIZE]);

    const checkBoxCompletion = (newHorizontal, newVertical, newBoxes) => {
        let boxesCompleted = 0;
        const updatedBoxes = [...newBoxes.map(row => [...row])];
        const currentPlayer = players[turnIndex]?.name;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Verificar si la caja está completa y no ha sido marcada antes
                if (
                    newHorizontal[r] && newHorizontal[r][c] &&
                    newHorizontal[r + 1] && newHorizontal[r + 1][c] &&
                    newVertical[r] && newVertical[r][c] &&
                    newVertical[r] && newVertical[r][c + 1] &&
                    !updatedBoxes[r][c]
                ) {
                    updatedBoxes[r][c] = currentPlayer;
                    boxesCompleted++;
                    console.log(`Caja completada en [${r}][${c}] por ${currentPlayer}`);
                }
            }
        }

        return { updatedBoxes, boxesCompleted };
    };

    const applyMove = (move, newTurnIndex = null, newScores = null, isLocal) => {
        const { type, row, col } = move;

        console.log(`Aplicando movimiento: ${type} en [${row}][${col}], local: ${isLocal}`);

        // Verificar si el movimiento es válido
        if (type === "h" && horizontalLines[row] && horizontalLines[row][col]) {
            console.log("Línea horizontal ya marcada");
            return;
        }
        if (type === "v" && verticalLines[row] && verticalLines[row][col]) {
            console.log("Línea vertical ya marcada");
            return;
        }

        // Crear copias de los estados
        const newHorizontal = horizontalLines.map(row => [...row]);
        const newVertical = verticalLines.map(row => [...row]);
        const newBoxes = boxes.map(row => [...row]);
        let updatedScores = newScores ? { ...newScores } : { ...scores };

        // Aplicar el movimiento
        if (type === "h") {
            newHorizontal[row][col] = true;
            console.log(`Línea horizontal marcada en [${row}][${col}]`);
        } else if (type === "v") {
            newVertical[row][col] = true;
            console.log(`Línea vertical marcada en [${row}][${col}]`);
        }

        // Verificar si se completaron cajas
        const { updatedBoxes, boxesCompleted } = checkBoxCompletion(newHorizontal, newVertical, newBoxes);

        let finalTurnIndex = turnIndex;

        // Solo calcular scores y cambio de turno si es un movimiento local
        if (isLocal) {
            // Actualizar scores si se completaron cajas
            const currentPlayer = players[turnIndex]?.name;
            if (boxesCompleted > 0 && currentPlayer) {
                updatedScores[currentPlayer] = (updatedScores[currentPlayer] || 0) + boxesCompleted;
                console.log(`${currentPlayer} completó ${boxesCompleted} caja(s). Score: ${updatedScores[currentPlayer]}`);
            }

            // Cambiar turno solo si no se completó ninguna caja
            if (boxesCompleted === 0) {
                finalTurnIndex = (turnIndex + 1) % 2;
                console.log(`Cambiando turno al jugador ${finalTurnIndex}: ${players[finalTurnIndex]?.name}`);
            } else {
                console.log(`${currentPlayer} mantiene el turno por completar caja(s)`);
                finalTurnIndex = turnIndex; // Mantener el turno actual
            }
        } else {
            // Si es un movimiento remoto, usar el turnIndex recibido
            finalTurnIndex = newTurnIndex !== null ? newTurnIndex : turnIndex;
        }

        // Actualizar estados
        setHorizontalLines(newHorizontal);
        setVerticalLines(newVertical);
        setBoxes(updatedBoxes);
        setScores(updatedScores);
        setTurnIndex(finalTurnIndex);

        // Si es un movimiento local, enviarlo al oponente con toda la información necesaria
        if (isLocal) {
            console.log("Enviando movimiento al servidor");
            socket.emit("make_move", {
                roomCode: roomCode.trim().toLowerCase(),
                move,
                newTurnIndex: finalTurnIndex,
                scores: updatedScores,
                horizontalLines: newHorizontal,
                verticalLines: newVertical,
                boxes: updatedBoxes
            });
        }
    };

    const handleClick = (type, row, col) => {
        if (!isMyTurn) {
            console.log("No es tu turno");
            return;
        }

        // Verificar si la línea ya está marcada
        if (type === "h" && horizontalLines[row] && horizontalLines[row][col]) {
            console.log("Línea horizontal ya marcada");
            return;
        }
        if (type === "v" && verticalLines[row] && verticalLines[row][col]) {
            console.log("Línea vertical ya marcada");
            return;
        }

        const move = { type, row, col };
        console.log("Haciendo movimiento:", move);
        applyMove(move, null, null, true);
    };

    const renderBoard = () => {
        const board = [];

        for (let r = 0; r < GRID_SIZE * 2 + 1; r++) {
            const row = [];
            for (let c = 0; c < GRID_SIZE * 2 + 1; c++) {
                if (r % 2 === 0 && c % 2 === 0) {
                    // Puntos (dots)
                    row.push(<div key={`${r}-${c}`} className="dot" />);
                } else if (r % 2 === 0) {
                    // Líneas horizontales
                    const rowIndex = r / 2;
                    const colIndex = (c - 1) / 2;
                    const isActive = horizontalLines[rowIndex] && horizontalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`h-line ${isActive ? "taken" : ""}`}
                            onClick={() => handleClick("h", rowIndex, colIndex)}
                            style={{
                                cursor: isMyTurn && !isActive ? "pointer" : "default",
                                backgroundColor: isActive ? "#000" : "#ccc"
                            }}
                        />
                    );
                } else if (c % 2 === 0) {
                    // Líneas verticales
                    const rowIndex = (r - 1) / 2;
                    const colIndex = c / 2;
                    const isActive = verticalLines[rowIndex] && verticalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`v-line ${isActive ? "taken" : ""}`}
                            onClick={() => handleClick("v", rowIndex, colIndex)}
                            style={{
                                cursor: isMyTurn && !isActive ? "pointer" : "default",
                                backgroundColor: isActive ? "#000" : "#ccc"
                            }}
                        />
                    );
                } else {
                    // Cajas
                    const boxRow = (r - 1) / 2;
                    const boxCol = (c - 1) / 2;
                    const boxOwner = boxes[boxRow] && boxes[boxRow][boxCol];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`box ${boxOwner ? `player${getPlayerNumber(boxOwner)}` : ''}`}
                            style={{
                                backgroundColor: boxOwner ? (boxOwner === playerName ? "#e6f3ff" : "#ffe6e6") : "transparent",
                                border: "1px solid #ddd"
                            }}
                        >
                            {boxOwner ? boxOwner.charAt(0).toUpperCase() : ""}
                        </div>
                    );
                }
            }
            board.push(
                <div key={r} className="board-row">
                    {row}
                </div>
            );
        }

        return board;
    };

    if (!players || players.length < 2) {
        return (
            <div className="game-container">
                <h2>Esperando a que otro jugador se una...</h2>
                <p>Jugadores conectados: {players.length}/2</p>
                <p>Tu nombre: {playerName}</p>
                <p>Código de sala: {roomCode}</p>
                <p>Tamaño del tablero: {GRID_SIZE}x{GRID_SIZE}</p>
            </div>
        );
    }

    const totalBoxes = GRID_SIZE * GRID_SIZE;
    const completedBoxes = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const gameFinished = completedBoxes === totalBoxes;
    const currentPlayerName = players[turnIndex]?.name;    return (
        <div className="game-container">
            <h1 className="game-title">⚪ Dots & Boxes ⚪</h1>
            <div className="game-info">
                <p><strong>Sala:</strong> {roomCode}</p>
                <p><strong>Tablero:</strong> {GRID_SIZE}x{GRID_SIZE}</p>

                <div className={`turn-indicator player${getCurrentPlayerNumber()}`}>
                    Turno de {currentPlayerName === playerName ? "Tú" : currentPlayerName}
                </div>

                {gameFinished && <p><strong>¡Juego terminado!</strong></p>}
            </div>            <div className="scores">
                {players.map((p, index) => (
                    <div key={p.name} className={`player${index + 1}`}>
                        {p.name === playerName ? `${p.name} (tú)` : p.name}: {scores[p.name] || 0} puntos
                    </div>
                ))}
            </div><div className="voice-controls">
                <div className="voice-status">
                    {isConnecting ? (
                        <span className="connecting">🔄 Conectando audio...</span>
                    ) : (
                        <span className={`status ${connectionState}`}>
                            📡 Audio: {connectionState === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                    )}
                    
                    {/* Indicador de estado del micrófono */}
                    <div className="mic-status">
                        <span className={`mic-indicator ${micEnabled ? 'active' : 'inactive'}`}>
                            🎙️ Micrófono: {micEnabled ? 'Activo' : 'Desactivado'}
                        </span>
                    </div>

                    {/* Botón de emergencia visible solo si los controles están bloqueados */}
                    {isConnecting && (
                        <button 
                            onClick={() => forceEnableControls()}
                            className="force-enable-btn"
                            title="Usar solo si los controles se quedan bloqueados"
                        >
                            🚨 Forzar habilitación
                        </button>
                    )}
                </div>
                <div className="voice-buttons">
                    <button 
                        onClick={toggleMic} 
                        className={`voice-btn mic-btn ${micEnabled ? 'active' : ''}`}
                        disabled={isConnecting}
                        title={micEnabled ? "Haz clic para silenciar tu micrófono" : "Haz clic para activar tu micrófono y comenzar a hablar"}
                    >
                        {micEnabled ? "🔇 Silenciar Micrófono" : "🎙️ Activar Micrófono"}
                    </button>                    <button 
                        onClick={toggleAudio} 
                        className={`voice-btn audio-btn ${audioEnabled ? 'active' : ''}`}
                        disabled={isConnecting}
                        title={audioEnabled ? "Haz clic para silenciar el audio del oponente" : "Haz clic para activar el audio del oponente"}
                    >
                        {audioEnabled ? "🔈 Silenciar Audio" : "🔊 Activar Audio"}
                    </button>

                    {/* Botón de reconexión cuando falla la conexión */}
                    {connectionState === 'failed' && (
                        <button 
                            onClick={reconnectVoice} 
                            className="voice-btn reconnect-btn"
                            disabled={isConnecting}
                            title="La conexión de voz falló. Haz clic para intentar reconectar"
                        >
                            🔄 Reconectar Audio
                        </button>
                    )}
                </div>
                
                {/* Mensaje informativo cuando el micrófono está desactivado */}
                {!micEnabled && !isConnecting && (
                    <div className="mic-info">
                        <small>💡 Tu micrófono está desactivado por defecto. Haz clic en "Activar Micrófono" para hablar.</small>
                    </div>
                )}
            </div>

            <div className="game-board">{renderBoard()}</div>
            <div className="debug-info" style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>Tamaño del tablero: {GRID_SIZE}x{GRID_SIZE}</p>
                <p>Cajas completadas: {completedBoxes}/{totalBoxes}</p>
                <p>Turno actual: {turnIndex} ({players[turnIndex]?.name})</p>
                <p>¿Es mi turno?: {isMyTurn ? 'Sí' : 'No'}</p>
            </div>
        </div>
    );
};

export default GameBoard;