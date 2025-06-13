// src/components/DotsBox.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useVoiceChat } from "../hooks/useVoice";
import { 
  Layout, 
  GameInfo, 
  VoiceControls, 
  GameStatus, 
  WaitingRoom,
  TurnIndicator,
  ScoreBoard,
  DotsBoxBoard,
  DebugPanel
} from "./ui";

import "./DotsBox.css";
import "./DotsBoxLayout.css";

const DotsBox = () => {
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
    console.log("Grid Size:", initialGridSize);    const [GRID_SIZE, setGridSize] = useState(initialGridSize);
    const [horizontalLines, setHorizontalLines] = useState([]);
    const [verticalLines, setVerticalLines] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [scores, setScores] = useState({});
    const [showDebug, setShowDebug] = useState(false);

    // Funciones helper para manejo de jugadores
    const getPlayerNumber = (playerName) => {
        if (!players || players.length < 2) return null;
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex + 1; // Convertir índice a número de jugador (1 o 2)
    };

    const getCurrentPlayerNumber = () => {
        const currentPlayerName = players[turnIndex]?.name;
        return getPlayerNumber(currentPlayerName);
    };    // Inicializar arrays basados en el tamaño de cuadrícula
    useEffect(() => {
        const size = initialGridSize || 3;
        setGridSize(size);

        setHorizontalLines(Array(size + 1).fill(null).map(() => Array(size).fill(false)));
        setVerticalLines(Array(size).fill(null).map(() => Array(size + 1).fill(false)));
        setBoxes(Array(size).fill(null).map(() => Array(size).fill(null)));
    }, [initialGridSize]);

    useEffect(() => {
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
        }        const move = { type, row, col };
        console.log("Haciendo movimiento:", move);
        applyMove(move, null, null, true);
    };

    if (!players || players.length < 2) {
        return (
            <Layout variant="gaming">
                <WaitingRoom
                    playerName={playerName}
                    roomCode={roomCode}
                    players={players}
                    maxPlayers={2}
                    gameType="dots-boxes"
                    gridSize={GRID_SIZE}
                    variant="glass"
                />
            </Layout>
        );
    }

    const totalBoxes = GRID_SIZE * GRID_SIZE;
    const completedBoxes = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const gameFinished = completedBoxes === totalBoxes;
    const currentPlayerName = players[turnIndex]?.name;

    return (
        <Layout variant="gaming">
            <div className="dots-box-game">
                <GameInfo
                    gameTitle="Dots & Boxes"
                    gameIcon="⚪"
                    roomCode={roomCode}
                    players={players}
                    currentPlayer={playerName}
                    turnIndex={turnIndex}
                    gridSize={GRID_SIZE}
                    gameType="dots-boxes"
                    gameFinished={gameFinished}
                    scores={scores}
                    variant="glass"
                />

                <VoiceControls
                    micEnabled={micEnabled}
                    audioEnabled={audioEnabled}
                    toggleMic={toggleMic}
                    toggleAudio={toggleAudio}
                    isConnecting={isConnecting}
                    connectionState={connectionState}
                    forceEnableControls={forceEnableControls}
                    reconnectVoice={reconnectVoice}
                    variant="glass"
                />

                {!gameFinished && (
                    <TurnIndicator
                        isMyTurn={isMyTurn}
                        currentPlayerName={currentPlayerName}
                        currentPlayer={playerName}
                        gameType="dots-boxes"
                        variant="glass"
                    />
                )}

                <ScoreBoard
                    players={players}
                    scores={scores}
                    currentPlayer={playerName}
                    gameType="dots-boxes"
                    variant="glass"
                />

                <DotsBoxBoard
                    gridSize={GRID_SIZE}
                    horizontalLines={horizontalLines}
                    verticalLines={verticalLines}
                    boxes={boxes}
                    onLineClick={handleClick}
                    isMyTurn={isMyTurn}
                    players={players}
                    currentPlayer={playerName}
                    variant="glass"
                />

                {gameFinished && (
                    <GameStatus
                        gameEnded={gameFinished}
                        winner={Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)}
                        isDraw={false}
                        currentPlayer={playerName}
                        onRestart={() => {
                            // Implementar restart si es necesario
                        }}
                        gameType="dots-boxes"
                        players={players}
                        scores={scores}
                        variant="glass"
                    />
                )}

                <DebugPanel
                    players={players}
                    turnIndex={turnIndex}
                    currentPlayer={playerName}
                    isMyTurn={isMyTurn}
                    gameEnded={gameFinished}
                    connectionState={connectionState}
                    isConnecting={isConnecting}
                    micEnabled={micEnabled}
                    audioEnabled={audioEnabled}
                    customData={{
                        'Grid Size': `${GRID_SIZE}x${GRID_SIZE}`,
                        'Completed Boxes': `${completedBoxes}/${totalBoxes}`,
                        'Scores': JSON.stringify(scores)
                    }}
                    show={showDebug}
                    onToggle={() => setShowDebug(!showDebug)}
                    variant="glass"
                />
            </div>
        </Layout>
    );
};

export default DotsBox;