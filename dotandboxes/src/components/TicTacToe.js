// src/components/TicTacToe.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useVoiceChat } from "../hooks/useVoice";
import "./TicTacToe.css";

const TicTacToe = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [] } = location.state || {};
    const socket = useSocket();    const {
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

    const [board, setBoard] = useState(Array(9).fill(null));    const [turnIndex, setTurnIndex] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);

    // Obtener el símbolo del jugador actual ('X' o 'O')
    const getPlayerSymbol = () => {
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex === 0 ? 'X' : 'O';
    };

    // Verificar si es el turno del jugador actual
    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;    useEffect(() => {
        // Solo necesitamos este useEffect para configuraciones iniciales si es necesario
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
    };    const handleRestart = () => {
        socket.emit("restart_game", {
            roomCode: roomCode.trim().toLowerCase()
        });
    };    // Función de emergencia para habilitar controles si se quedan bloqueados
    const handleForceEnableControls = () => {
        console.log('Forzando habilitación de controles de audio');
        forceEnableControls();
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

            {renderGameStatus()}            <div className="voice-controls">
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
                            onClick={handleForceEnableControls}
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

            <div className="board">
                {Array.from({ length: 9 }, (_, index) => renderCell(index))}
            </div>

            {gameEnded && (
                <div className="game-controls">
                    <button onClick={handleRestart} className="restart-btn">
                        🔄 Jugar de Nuevo
                    </button>
                </div>
            )}            <div className="debug-info">
                <p>Turno: {turnIndex} ({players[turnIndex]?.name})</p>
                <p>Tu símbolo: {getPlayerSymbol()}</p>
                <p>¿Es tu turno?: {isMyTurn ? 'Sí' : 'No'}</p>
                <p>Estado del juego: {gameEnded ? 'Terminado' : 'En progreso'}</p>
                <p>Audio - Conectando: {isConnecting ? 'Sí' : 'No'}</p>
                <p>Audio - Estado: <span className={connectionState === 'failed' ? 'status-failed' : connectionState === 'connected' ? 'status-connected' : ''}>{connectionState}</span></p>
                <p>Micrófono: {micEnabled ? 'Encendido' : 'Apagado'}</p>
                <p>Audio remoto: {audioEnabled ? 'Encendido' : 'Apagado'}</p>
                {connectionState === 'failed' && (
                    <p className="connection-help">⚠️ Conexión de audio falló - usa el botón "Reconectar Audio" arriba</p>
                )}
            </div>
        </div>
    );
};

export default TicTacToe;