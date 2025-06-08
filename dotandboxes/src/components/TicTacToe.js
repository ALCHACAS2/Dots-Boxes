// src/components/TicTacToe.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useVoiceChat } from "../hooks/useVoice";
import "./TicTacToe.css";

const TicTacToe = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [] } = location.state || {};
    const socket = useSocket();

    const {
        micEnabled,
        audioEnabled,
        toggleMic,
        toggleAudio
    } = useVoiceChat({
        socket,
        roomCode,
        isInitiator: players[0]?.name === playerName
    });

    const [board, setBoard] = useState(Array(9).fill(null));
    const [turnIndex, setTurnIndex] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [opponentName, setOpponentName] = useState("Tu oponente");

    // Obtener el símbolo del jugador actual ('X' o 'O')
    const getPlayerSymbol = () => {
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex === 0 ? 'X' : 'O';
    };

    // Verificar si es el turno del jugador actual
    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;

    useEffect(() => {
        if (players.length === 2) {
            const opponent = players.find(p => p.name !== playerName);
            if (opponent) setOpponentName(opponent.name);
        }
    }, [players, playerName]);

    useEffect(() => {
        // Escuchar movimientos del oponente
        socket.on("tic_tac_toe_move_made", (moveData) => {
            console.log("Movimiento de 3 en línea recibido:", moveData);
            setBoard(moveData.board);
            setTurnIndex(moveData.turnIndex);
        });

        // Escuchar estado del juego
        socket.on("game_state", (gameState) => {
            console.log("Estado del juego 3 en línea recibido:", gameState);
            if (gameState && gameState.gameType === 'tic-tac-toe') {
                setBoard(gameState.board || Array(9).fill(null));
                setTurnIndex(gameState.turnIndex || 0);
                setGameEnded(gameState.gameEnded || false);
                setWinner(gameState.winner || null);
                setIsDraw(gameState.isDraw || false);
            }
        });

        // Escuchar fin de juego
        socket.on("ticTacToeGameEnded", (result) => {
            console.log("Juego terminado:", result);
            setGameEnded(true);
            
            if (result.result === 'draw') {
                setIsDraw(true);
                setWinner(null);
            } else if (result.result === 'win') {
                setWinner(result.winner);
                setIsDraw(false);
            }
        });

        // Escuchar reinicios de juego
        socket.on("gameRestarted", (newGameState) => {
            console.log("Juego reiniciado:", newGameState);
            setBoard(newGameState.board || Array(9).fill(null));
            setTurnIndex(0);
            setGameEnded(false);
            setWinner(null);
            setIsDraw(false);
        });

        // Escuchar movimientos inválidos
        socket.on("invalidMove", (data) => {
            console.log("Movimiento inválido en posición:", data.position);
            alert("Movimiento inválido. La casilla ya está ocupada.");
        });

        return () => {
            socket.off("tic_tac_toe_move_made");
            socket.off("game_state");
            socket.off("ticTacToeGameEnded");
            socket.off("gameRestarted");
            socket.off("invalidMove");
        };
    }, [socket]);

    const handleCellClick = (position) => {
        // Verificar que es el turno del jugador y que la celda está vacía
        if (!isMyTurn || board[position] !== null || gameEnded) {
            console.log("Movimiento no permitido:", { isMyTurn, cellEmpty: board[position] === null, gameEnded });
            return;
        }

        const playerSymbol = getPlayerSymbol();
        console.log(`Haciendo movimiento en posición ${position} con símbolo ${playerSymbol}`);

        // Enviar movimiento al servidor
        socket.emit("tic_tac_toe_move", {
            roomCode: roomCode.trim().toLowerCase(),
            position: position,
            symbol: playerSymbol
        });
    };

    const handleRestart = () => {
        socket.emit("restart_game", {
            roomCode: roomCode.trim().toLowerCase()
        });
    };

    const renderCell = (position) => {
        const value = board[position];
        return (
            <div
                key={position}
                className={`cell ${value ? 'filled' : ''} ${value === 'X' ? 'x' : value === 'O' ? 'o' : ''}`}
                onClick={() => handleCellClick(position)}
                style={{
                    cursor: isMyTurn && !value && !gameEnded ? 'pointer' : 'default'
                }}
            >
                {value && <span className="symbol">{value}</span>}
            </div>
        );
    };

    const renderGameStatus = () => {
        if (gameEnded) {
            if (isDraw) {
                return <div className="game-status draw">🤝 ¡Empate!</div>;
            } else if (winner === playerName) {
                return <div className="game-status win">🎉 ¡Ganaste!</div>;
            } else {
                return <div className="game-status lose">😔 Perdiste. Ganó: {winner}</div>;
            }
        } else {
            const currentPlayerName = players[turnIndex]?.name;
            return (
                <div className={`game-status turn ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
                    {isMyTurn ? 
                        `🎯 Tu turno (${getPlayerSymbol()})` : 
                        `⏳ Turno de ${currentPlayerName} (${turnIndex === 0 ? 'X' : 'O'})`
                    }
                </div>
            );
        }
    };

    if (!players || players.length < 2) {
        return (
            <div className="tic-tac-toe-container">
                <h2>Esperando a que otro jugador se una...</h2>
                <p>Jugadores conectados: {players.length}/2</p>
                <p>Tu nombre: {playerName}</p>
                <p>Código de sala: {roomCode}</p>
            </div>
        );
    }

    return (
        <div className="tic-tac-toe-container">
            <h1 className="game-title">❌⚪ 3 en Línea</h1>
            
            <div className="game-info">
                <p><strong>Sala:</strong> {roomCode}</p>
                <div className="players-info">
                    {players.map((player, index) => (
                        <div key={player.name} className={`player-info ${player.name === playerName ? 'current-player' : ''}`}>
                            <span className="player-name">
                                {player.name === playerName ? `${player.name} (tú)` : player.name}
                            </span>
                            <span className="player-symbol">{index === 0 ? 'X' : 'O'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {renderGameStatus()}

            <div className="voice-controls">
                <button onClick={toggleMic} className={`voice-btn ${micEnabled ? 'active' : ''}`}>
                    {micEnabled ? "🔇 Apagar Micrófono" : "🎙️ Encender Micrófono"}
                </button>
                <button onClick={toggleAudio} className={`voice-btn ${audioEnabled ? 'active' : ''}`}>
                    {audioEnabled ? "🔈 Silenciar Audio" : "🔊 Activar Audio"}
                </button>
            </div>

            <div className="board">
                {Array.from({ length: 9 }, (_, index) => renderCell(index))}
            </div>

            {gameEnded && (
                <div className="game-controls">
                    <button onClick={handleRestart} className="restart-btn">
                        🔄 Jugar de Nuevo
                    </button>
                </div>
            )}

            <div className="debug-info">
                <p>Turno: {turnIndex} ({players[turnIndex]?.name})</p>
                <p>Tu símbolo: {getPlayerSymbol()}</p>
                <p>¿Es tu turno?: {isMyTurn ? 'Sí' : 'No'}</p>
                <p>Estado del juego: {gameEnded ? 'Terminado' : 'En progreso'}</p>
            </div>
        </div>
    );
};

export default TicTacToe;