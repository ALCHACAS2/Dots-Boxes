// src/components/GameBoard.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import "./GameBoard.css";

const GRID_SIZE = 3; // Tamaño del tablero (3x3 cajas)

const GameBoard = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [] } = location.state || {};
    const socket = useSocket();

    console.log("Location state:", location.state);
    console.log("Players:", players);
    console.log("Players length:", players?.length);

    const [horizontalLines, setHorizontalLines] = useState(
        Array(GRID_SIZE + 1).fill(null).map(() => Array(GRID_SIZE).fill(false))
    );
    const [verticalLines, setVerticalLines] = useState(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE + 1).fill(false))
    );
    const [boxes, setBoxes] = useState(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [turnIndex, setTurnIndex] = useState(0);
    const [scores, setScores] = useState({});
    const [opponentName, setOpponentName] = useState("Tu oponente");
    const [gameState, setGameState] = useState({
        horizontalLines: Array(GRID_SIZE + 1).fill(null).map(() => Array(GRID_SIZE).fill(false)),
        verticalLines: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE + 1).fill(false)),
        boxes: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
        turnIndex: 0,
        scores: {}
    });

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
            setGameState(prev => ({ ...prev, scores: initialScores }));
        }
    }, [players, playerName]);

    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;

    useEffect(() => {
        socket.on("opponent_move", (move) => {
            console.log("Movimiento del oponente recibido:", move);
            applyMove(move, false);
        });

        socket.on("game_state", (newGameState) => {
            console.log("Estado del juego recibido:", newGameState);
            if (newGameState) {
                setGameState(newGameState);
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
    }, [socket]);

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

    const applyMove = (move, isLocal) => {
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
        const newScores = { ...scores };

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

        // Actualizar scores si se completaron cajas
        const currentPlayer = players[turnIndex]?.name;
        if (boxesCompleted > 0 && currentPlayer) {
            newScores[currentPlayer] = (newScores[currentPlayer] || 0) + boxesCompleted;
            console.log(`${currentPlayer} completó ${boxesCompleted} caja(s). Score: ${newScores[currentPlayer]}`);
        }

        // Actualizar estados
        setHorizontalLines(newHorizontal);
        setVerticalLines(newVertical);
        setBoxes(updatedBoxes);
        setScores(newScores);

        // Cambiar turno solo si no se completó ninguna caja
        if (boxesCompleted === 0) {
            const newTurnIndex = (turnIndex + 1) % 2;
            setTurnIndex(newTurnIndex);
            console.log(`Cambiando turno al jugador ${newTurnIndex}: ${players[newTurnIndex]?.name}`);
        } else {
            console.log(`${currentPlayer} mantiene el turno por completar caja(s)`);
        }

        // Si es un movimiento local, enviarlo al oponente
        if (isLocal) {
            console.log("Enviando movimiento al servidor");
            socket.emit("make_move", {
                roomCode: roomCode.trim().toLowerCase(),
                move
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
        applyMove(move, true);
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
                            className="box"
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
            <div>
                <h2>Esperando a que otro jugador se una...</h2>
                <p>Jugadores conectados: {players.length}/2</p>
                <p>Tu nombre: {playerName}</p>
                <p>Código de sala: {roomCode}</p>
            </div>
        );
    }

    const totalBoxes = GRID_SIZE * GRID_SIZE;
    const completedBoxes = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const gameFinished = completedBoxes === totalBoxes;

    return (
        <div className="game-container">
            <h2>Dots and Boxes</h2>
            <div className="game-info">
                <p><strong>Sala:</strong> {roomCode}</p>
                <p><strong>Turno de:</strong> {isMyTurn ? "Tú" : opponentName}</p>
                {gameFinished && <p><strong>¡Juego terminado!</strong></p>}
            </div>
            <div className="scores">
                {players.map((p) => (
                    <div key={p.name} style={{
                        fontWeight: p.name === playerName ? 'bold' : 'normal',
                        color: p.name === playerName ? '#3b82f6' : 'black'
                    }}>
                        {p.name === playerName ? `${p.name} (tú)` : p.name}: {scores[p.name] || 0} puntos
                    </div>
                ))}
            </div>
            <div className="game-board">{renderBoard()}</div>
            <div className="debug-info" style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>Cajas completadas: {completedBoxes}/{totalBoxes}</p>
                <p>Turno actual: {turnIndex} ({players[turnIndex]?.name})</p>
            </div>
        </div>
    );
};

export default GameBoard;