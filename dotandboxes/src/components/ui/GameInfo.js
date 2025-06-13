import React from 'react';
import { Card, Header } from '../ui';
import './GameInfo.css';

const GameInfo = ({
    gameTitle,
    gameIcon,
    roomCode,
    players = [],
    currentPlayer,
    turnIndex,
    gridSize,
    gameType,
    gameFinished = false,
    scores = {},
    children,
    variant = 'glass'
}) => {
    const getCurrentPlayerName = () => {
        return players[turnIndex]?.name;
    };

    const isMyTurn = () => {
        return players.length === 2 && players[turnIndex]?.name === currentPlayer;
    };

    const getPlayerSymbol = (playerIndex) => {
        if (gameType === 'tic-tac-toe') {
            return playerIndex === 0 ? 'X' : 'O';
        }
        return `P${playerIndex + 1}`;
    };

    return (
        <Card variant={variant} size="medium" className="game-info-card">
            <Header
                title={gameTitle}
                icon={gameIcon}
                variant="gaming"
                size="medium"
            />

            <div className="game-details">
                <div className="room-info">
                    <span className="room-label">📱 Sala:</span>
                    <span className="room-code">{roomCode}</span>
                </div>

                {gridSize && (
                    <div className="grid-info">
                        <span className="grid-label">📐 Tablero:</span>
                        <span className="grid-size">{gridSize}x{gridSize}</span>
                    </div>
                )}
            </div>

            <div className="players-section">
                <h4 className="players-title">👥 Jugadores</h4>
                <div className="players-grid">
                    {players.map((player, index) => (
                        <div
                            key={player.name}
                            className={`player-card ${player.name === currentPlayer ? 'current-player' : ''}`}
                        >
                            <div className="player-avatar">
                                <span className="player-initial">
                                    {player.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="player-symbol">
                                    {getPlayerSymbol(index)}
                                </span>
                            </div>
                            <div className="player-info">
                                <span className="player-name">
                                    {player.name === currentPlayer ? `${player.name} (tú)` : player.name}
                                </span>
                                {scores[player.name] !== undefined && (
                                    <span className="player-score">
                                        {scores[player.name]} pts
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!gameFinished && (
                <div className={`turn-indicator ${isMyTurn() ? 'my-turn' : 'opponent-turn'}`}>
                    <div className="turn-icon">
                        {isMyTurn() ? '🎯' : '⏳'}
                    </div>
                    <div className="turn-text">
                        {isMyTurn() ?
                            `Tu turno (${getPlayerSymbol(players.findIndex(p => p.name === currentPlayer))})` :
                            `Turno de ${getCurrentPlayerName()}`
                        }
                    </div>
                </div>
            )}

            {gameFinished && (
                <div className="game-finished">
                    🏁 ¡Juego terminado!
                </div>
            )}

            {children}
        </Card>
    );
};

export default GameInfo;
