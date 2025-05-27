// src/components/GameBoard.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import "./GameBoard.css";

const GRID_SIZE = 3; // Tamaño del tablero (3x3 cajas)

const GameBoard = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [], gridSize: initialGridSize = 3 } = location.state || {};
    const socket = useSocket();

    console.log("Location state:", location.state);
    console.log("Players:", players);
    console.log("Grid Size:", initialGridSize);

    const [gridSize, setGridSize] = useState(initialGridSize);
    const [horizontalLines, setHorizontalLines] = useState(
        Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(false))
    );
    const [verticalLines, setVerticalLines] = useState(
        Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(false))
    );
    const [boxes, setBoxes] = useState(
        Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
    );

    const [turnIndex, setTurnIndex] = useState(0);
    const [scores, setScores] = useState({});
    const [opponentName, setOpponentName] = useState("Tu oponente");

    // Actualizar arrays cuando cambie el tamaño del grid
    useEffect(() => {
        setHorizontalLines(Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(false)));
        setVerticalLines(Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(false)));
        setBoxes(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    }, [gridSize]);

    useEffect(() => {
        if (players.length === 2) {
            const opponent = players.find(p => p.name !== playerName);
            if (opponent) setOpponentName(opponent.name);

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
                setTurnIndex(newGameState.turnIndex || 0);
                if (newGameState.scores) setScores(newGameState.scores);
                if (newGameState.horizontalLines) setHorizontalLines(newGameState.horizontalLines);
                if (newGameState.verticalLines) setVerticalLines(newGameState.verticalLines);
                if (newGameState.boxes) setBoxes(newGameState.boxes);
                if (newGameState.gridSize) setGridSize(newGameState.gridSize);
            }
        });

        return () => {
            socket.off("opponent_move");
            socket.off("game_state");
        };
    }, [socket]);

    const checkBoxCompletion = (newHorizontal, newVertical, newBoxes) => {
        let boxesCompleted = 0;
        const updatedBoxes = [...newBoxes.map(row => [...row])];
        const currentPlayer = players[turnIndex]?.name;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
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

        for (let r = 0; r < gridSize * 2 + 1; r++) {
            const row = [];
            for (let c = 0; c < gridSize * 2 + 1; c++) {
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
                            className="box"
                            style={{
                                backgroundColor: boxOwner ?
                                    (boxOwner === playerName ? "#cee7a7" : "#e7cca7") :
                                    "transparent",
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
            <div className="game-container waiting">
                <div className="waiting-card">
                    <h2>Esperando jugadores...</h2>
                    <p>Jugadores conectados: {players.length}/2</p>
                    <p>Tu nombre: <strong>{playerName}</strong></p>
                    <p>Código de sala: <strong>{roomCode}</strong></p>
                    <p>Tamaño del tablero: <strong>{gridSize}x{gridSize}</strong></p>
                </div>
            </div>
        );
    }

    const totalBoxes = gridSize * gridSize;
    const completedBoxes = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const gameFinished = completedBoxes === totalBoxes;
    const currentPlayerName = players[turnIndex]?.name;

    // Determinar el ganador
    let winner = null;
    if (gameFinished) {
        const playerScores = players.map(p => ({ name: p.name, score: scores[p.name] || 0 }));
        playerScores.sort((a, b) => b.score - a.score);

        if (playerScores[0].score > playerScores[1].score) {
            winner = playerScores[0].name;
        } else {
            winner = "Empate";
        }
    }

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="players-info">
                    <div className={`player-card ${playerName === currentPlayerName ? 'current-turn' : ''}`}>
                        <h3>{playerName} (Tú)</h3>
                        <p>Puntos: {scores[playerName] || 0}</p>
                    </div>
                    <div className="vs">VS</div>
                    <div className={`player-card ${opponentName === currentPlayerName ? 'current-turn' : ''}`}>
                        <h3>{opponentName}</h3>
                        <p>Puntos: {scores[opponentName] || 0}</p>
                    </div>
                </div>

                <div className="game-info">
                    <p>Sala: <strong>{roomCode}</strong></p>
                    <p>Tablero: <strong>{gridSize}x{gridSize}</strong></p>
                    {!gameFinished && (
                        <p className="turn-indicator">
                            {isMyTurn ? "¡Es tu turno!" : `Turno de ${currentPlayerName}`}
                        </p>
                    )}
                </div>
            </div>

            {gameFinished && (
                <div className="game-result">
                    {winner === "Empate" ? (
                        <h2>¡Empate!</h2>
                    ) : winner === playerName ? (
                        <h2>¡Ganaste!</h2>
                    ) : (
                        <h2>¡Perdiste!</h2>
                    )}
                    <p>Puntuación final: {scores[playerName] || 0} - {scores[opponentName] || 0}</p>
                </div>
            )}

            <div className="game-board">
                {renderBoard()}
            </div>

            <div className="game-stats">
                <p>Cajas completadas: {completedBoxes}/{totalBoxes}</p>
                <p>Progreso: {Math.round((completedBoxes / totalBoxes) * 100)}%</p>
            </div>
        </div>
    );
};

export default GameBoard;