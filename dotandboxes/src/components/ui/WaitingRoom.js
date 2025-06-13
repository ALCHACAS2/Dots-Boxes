import React from 'react';
import { Card, Header, Spinner, Button } from '../ui';
import './WaitingRoom.css';

const WaitingRoom = ({
    playerName,
    roomCode,
    players = [],
    maxPlayers = 2,
    gridSize,
    gameType,
    onLeave,
    variant = 'glass'
}) => {
    const getGameTypeLabel = (type) => {
        switch (type) {
            case 'tic-tac-toe':
                return '3 en Línea';
            case 'dots-boxes':
                return 'Dots & Boxes';
            default:
                return type;
        }
    };

    const getGameIcon = (type) => {
        switch (type) {
            case 'tic-tac-toe':
                return '❌⚪';
            case 'dots-boxes':
                return '⚪';
            default:
                return '🎮';
        }
    };

    return (
        <div className="waiting-room">
            <Card variant={variant} size="large" className="waiting-card">
                <Header
                    title="Esperando jugadores..."
                    icon="⏳"
                    variant="gaming"
                    size="large"
                />

                <div className="waiting-content">
                    <div className="room-details">
                        <div className="detail-item">
                            <span className="detail-label">🎮 Juego:</span>
                            <span className="detail-value">
                                {getGameIcon(gameType)} {getGameTypeLabel(gameType)}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">📱 Sala:</span>
                            <span className="detail-value room-code">{roomCode}</span>
                        </div>

                        {gridSize && (
                            <div className="detail-item">
                                <span className="detail-label">📐 Tablero:</span>
                                <span className="detail-value">{gridSize}x{gridSize}</span>
                            </div>
                        )}

                        <div className="detail-item">
                            <span className="detail-label">👥 Jugadores:</span>
                            <span className="detail-value">{players.length}/{maxPlayers}</span>
                        </div>
                    </div>

                    <div className="players-waiting">
                        <h4 className="players-title">Jugadores conectados:</h4>
                        <div className="players-list">
                            {players.map((player, index) => (
                                <div
                                    key={player.name}
                                    className={`player-item ${player.name === playerName ? 'current-player' : ''}`}
                                >
                                    <div className="player-avatar">
                                        <span className="player-initial">
                                            {player.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="player-number">#{index + 1}</div>
                                    </div>
                                    <div className="player-info">
                                        <span className="player-name">
                                            {player.name === playerName ? `${player.name} (tú)` : player.name}
                                        </span>
                                        <span className="player-status">
                                            <span className="status-dot"></span>
                                            Conectado
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Placeholders para jugadores faltantes */}
                            {Array.from({ length: maxPlayers - players.length }, (_, index) => (
                                <div key={`waiting-${index}`} className="player-item waiting-slot">
                                    <div className="player-avatar placeholder">
                                        <span className="player-initial">?</span>
                                        <div className="player-number">#{players.length + index + 1}</div>
                                    </div>
                                    <div className="player-info">
                                        <span className="player-name">Esperando jugador...</span>
                                        <span className="player-status pending">
                                            <span className="status-dot"></span>
                                            Pendiente
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="waiting-indicator">
                        <Spinner
                            size="large"
                            variant="primary"
                            text="Esperando a que se una otro jugador..."
                        />
                    </div>

                    <div className="waiting-tips">
                        <h5 className="tips-title">💡 Mientras esperas:</h5>
                        <ul className="tips-list">
                            <li>Comparte el código de sala <strong>{roomCode}</strong> con tu amigo</li>
                            <li>Asegúrate de tener una buena conexión a internet</li>
                            <li>El juego comenzará automáticamente cuando se unan {maxPlayers} jugadores</li>
                            {gameType === 'dots-boxes' && (
                                <li>Has seleccionado un tablero de {gridSize}x{gridSize}</li>
                            )}
                        </ul>
                    </div>

                    {onLeave && (
                        <div className="waiting-actions">
                            <Button
                                variant="danger"
                                size="medium"
                                onClick={onLeave}
                                icon="👈"
                                fullWidth
                            >
                                Salir de la sala
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WaitingRoom;
