import React from 'react';
import './PlayerList.css';

const PlayerList = ({
    players = [],
    currentPlayer,
    maxPlayers = 2,
    variant = 'default',
    size = 'medium',
    showWaiting = false,
    className = '',
    ...props
}) => {
    const baseClass = `player-list player-list--${variant} player-list--${size}`;

    return (
        <div className={`${baseClass} ${className}`} {...props}>
            <div className="player-list__header">
                <h3 className="player-list__title">
                    Jugadores ({players.length}/{maxPlayers})
                </h3>
                {players.length < maxPlayers && (
                    <div className="player-list__status">
                        <div className="player-list__indicator" />
                        Esperando jugadores...
                    </div>
                )}
            </div>

            <div className="player-list__items">
                {players.map((player, index) => (
                    <PlayerCard
                        key={index}
                        player={player}
                        isCurrentPlayer={player.name === currentPlayer}
                        variant={variant}
                        size={size}
                        position={index + 1}
                    />
                ))}

                {/* Placeholders for missing players */}
                {Array.from({ length: maxPlayers - players.length }, (_, index) => (
                    <PlayerPlaceholder
                        key={`placeholder-${index}`}
                        position={players.length + index + 1}
                        variant={variant}
                        size={size}
                    />
                ))}
            </div>

            {showWaiting && players.length < maxPlayers && (
                <div className="player-list__waiting">
                    <div className="waiting-animation">
                        <div className="waiting-dot"></div>
                        <div className="waiting-dot"></div>
                        <div className="waiting-dot"></div>
                    </div>
                    <p>Esperando a que se una otro jugador...</p>
                </div>
            )}
        </div>
    );
};

const PlayerCard = ({ player, isCurrentPlayer, variant, size, position }) => {
    const cardClass = `player-card player-card--${variant} player-card--${size}`;
    const modifierClasses = [
        isCurrentPlayer && 'player-card--current'
    ].filter(Boolean).join(' ');

    return (
        <div className={`${cardClass} ${modifierClasses}`}>
            <div className="player-card__avatar">
                <span className="player-card__avatar-text">
                    {player.name?.charAt(0)?.toUpperCase() || 'P'}
                </span>
                <div className="player-card__position">{position}</div>
            </div>
            <div className="player-card__info">
                <span className="player-card__name">{player.name}</span>
                {isCurrentPlayer && (
                    <span className="player-card__badge">Tú</span>
                )}
            </div>
            <div className="player-card__status">
                <div className="player-card__status-dot" />
                Conectado
            </div>
        </div>
    );
};

const PlayerPlaceholder = ({ position, variant, size }) => {
    const cardClass = `player-card player-card--${variant} player-card--${size} player-card--placeholder`;

    return (
        <div className={cardClass}>
            <div className="player-card__avatar player-card__avatar--placeholder">
                <span className="player-card__avatar-text">?</span>
                <div className="player-card__position">{position}</div>
            </div>
            <div className="player-card__info">
                <span className="player-card__name">Esperando jugador...</span>
            </div>
            <div className="player-card__status player-card__status--pending">
                <div className="player-card__status-dot" />
                Pendiente
            </div>
        </div>
    );
};

export default PlayerList;
