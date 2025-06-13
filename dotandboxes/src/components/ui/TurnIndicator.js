import React from 'react';
import Card from './Card';
import './TurnIndicator.css';

const TurnIndicator = ({
    isMyTurn,
    currentPlayerName,
    currentPlayer,
    playerSymbol,
    gameType = 'tic-tac-toe',
    variant = 'glass',
    className = ''
}) => {
    const getSymbolDisplay = () => {
        if (gameType === 'tic-tac-toe') {
            return playerSymbol || '';
        }
        return '';
    };

    const getTurnMessage = () => {
        if (isMyTurn) {
            const symbol = getSymbolDisplay();
            return (
                <div className="turn-message my-turn">
                    <span className="turn-icon">🎯</span>
                    <span className="turn-text">
                        Tu turno {symbol && `(${symbol})`}
                    </span>
                </div>
            );
        } else {
            const symbol = getSymbolDisplay();
            return (
                <div className="turn-message opponent-turn">
                    <span className="turn-icon">⏳</span>
                    <span className="turn-text">
                        Turno de {currentPlayerName} {symbol && `(${symbol})`}
                    </span>
                </div>
            );
        }
    };

    return (
        <Card
            variant={variant}
            size="small"
            className={`turn-indicator ${isMyTurn ? 'is-my-turn' : 'is-opponent-turn'} ${className}`}
        >
            {getTurnMessage()}
        </Card>
    );
};

export default TurnIndicator;
