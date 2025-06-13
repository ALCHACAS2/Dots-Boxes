// src/components/TicTacToe.js
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
  GameBoard,
  DebugPanel
} from "./ui";
import "./TicTacToe.css";
import "./TicTacToeLayout.css";

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
    });    const [board, setBoard] = useState(Array(9).fill(null));
    const [turnIndex, setTurnIndex] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    // Obtener el símbolo del jugador actual ('X' o 'O')
    const getPlayerSymbol = () => {
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex === 0 ? 'X' : 'O';
    };    // Verificar si es el turno del jugador actual
    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;

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
    };if (!players || players.length < 2) {
        return (
            <Layout variant="gaming">
                <WaitingRoom
                    playerName={playerName}
                    roomCode={roomCode}
                    players={players}
                    maxPlayers={2}
                    gameType="tic-tac-toe"
                    variant="glass"
                />
            </Layout>
        );
    }    return (
        <Layout variant="gaming">
            <div className="tic-tac-toe-game">
                <GameInfo
                    gameTitle="3 en Línea"
                    gameIcon="❌⚪"
                    roomCode={roomCode}
                    players={players}
                    currentPlayer={playerName}
                    turnIndex={turnIndex}
                    gameType="tic-tac-toe"
                    gameFinished={gameEnded}
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

                {!gameEnded && (
                    <TurnIndicator
                        isMyTurn={isMyTurn}
                        currentPlayerName={players[turnIndex]?.name}
                        currentPlayer={playerName}
                        playerSymbol={getPlayerSymbol()}
                        gameType="tic-tac-toe"
                        variant="glass"
                    />
                )}

                <GameBoard
                    board={board}
                    onCellClick={handleCellClick}
                    isMyTurn={isMyTurn}
                    gameEnded={gameEnded}
                    variant="glass"
                />

                <GameStatus
                    gameEnded={gameEnded}
                    winner={winner}
                    isDraw={isDraw}
                    currentPlayer={playerName}
                    onRestart={handleRestart}
                    gameType="tic-tac-toe"
                    players={players}
                    variant="glass"
                />

                <DebugPanel
                    players={players}
                    turnIndex={turnIndex}
                    currentPlayer={playerName}
                    isMyTurn={isMyTurn}
                    gameEnded={gameEnded}
                    connectionState={connectionState}
                    isConnecting={isConnecting}
                    micEnabled={micEnabled}
                    audioEnabled={audioEnabled}
                    customData={{
                        'Board': board.join(','),
                        'Winner': winner,
                        'Is Draw': isDraw
                    }}
                    show={showDebug}
                    onToggle={() => setShowDebug(!showDebug)}
                    variant="glass"
                />
            </div>
        </Layout>
    );
};

export default TicTacToe;