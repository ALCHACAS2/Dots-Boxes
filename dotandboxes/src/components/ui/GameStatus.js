import React from 'react';
import { Card, Button, Alert } from '../ui';
import './GameStatus.css';

const GameStatus = ({
  gameEnded = false,
  winner = null,
  isDraw = false,
  currentPlayer,
  onRestart,
  gameType = 'dots-boxes',
  scores = {},
  players = [],
  showRestartButton = true,
  children
}) => {
  const getGameResult = () => {
    if (!gameEnded) return null;

    if (isDraw) {
      return {
        type: 'draw',
        icon: '🤝',
        title: '¡Empate!',
        message: 'Ambos jugadores han empatado. ¡Buen juego!',
        variant: 'warning'
      };
    }

    if (winner === currentPlayer) {
      return {
        type: 'win',
        icon: '🎉',
        title: '¡Felicidades!',
        message: '¡Has ganado la partida!',
        variant: 'success'
      };
    }

    return {
      type: 'lose',
      icon: '😔',
      title: 'Fin del juego',
      message: `${winner} ha ganado esta partida.`,
      variant: 'error'
    };
  };

  const getScoresSummary = () => {
    if (!scores || Object.keys(scores).length === 0) return null;

    const sortedPlayers = players.sort((a, b) => {
      const scoreA = scores[a.name] || 0;
      const scoreB = scores[b.name] || 0;
      return scoreB - scoreA;
    });

    return sortedPlayers.map((player, index) => ({
      ...player,
      score: scores[player.name] || 0,
      position: index + 1,
      isWinner: index === 0 && gameEnded,
      isCurrentPlayer: player.name === currentPlayer
    }));
  };

  const result = getGameResult();
  const scoresSummary = getScoresSummary();

  if (!gameEnded && !children) {
    return null;
  }

  return (
    <div className="game-status-container">
      {gameEnded && result && (
        <Alert 
          variant={result.variant}
          size="large"
          className="game-result-alert"
        >
          <div className="result-content">
            <div className="result-icon">{result.icon}</div>
            <div className="result-text">
              <h3 className="result-title">{result.title}</h3>
              <p className="result-message">{result.message}</p>
            </div>
          </div>
        </Alert>
      )}

      {scoresSummary && scoresSummary.length > 0 && (
        <Card variant="glass" size="medium" className="scores-card">
          <h4 className="scores-title">
            {gameEnded ? '🏆 Resultados Finales' : '📊 Puntuación Actual'}
          </h4>
          <div className="scores-list">
            {scoresSummary.map((player) => (
              <div 
                key={player.name}
                className={`score-item ${player.isCurrentPlayer ? 'current-player' : ''} ${player.isWinner ? 'winner' : ''}`}
              >
                <div className="player-position">
                  {gameEnded ? (
                    player.position === 1 ? '🥇' : 
                    player.position === 2 ? '🥈' : '🥉'
                  ) : (
                    `#${player.position}`
                  )}
                </div>
                <div className="player-details">
                  <span className="player-name">
                    {player.isCurrentPlayer ? `${player.name} (tú)` : player.name}
                  </span>
                  <span className="player-score-value">
                    {player.score} {gameType === 'dots-boxes' ? 'cajas' : 'puntos'}
                  </span>
                </div>
                {player.isWinner && (
                  <div className="winner-badge">
                    ¡Ganador!
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {children && (
        <div className="game-status-content">
          {children}
        </div>
      )}

      {gameEnded && showRestartButton && onRestart && (
        <div className="game-actions">
          <Button
            variant="primary"
            size="large"
            onClick={onRestart}
            icon="🔄"
            fullWidth
          >
            Jugar de Nuevo
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
