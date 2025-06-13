import React from 'react';
import Card from './Card';
import './ScoreBoard.css';

const ScoreBoard = ({
  players = [],
  scores = {},
  currentPlayer,
  gameType = 'dots-boxes',
  variant = 'glass',
  className = ''
}) => {
  const getPlayerDisplayName = (player) => {
    return player.name === currentPlayer ? `${player.name} (tú)` : player.name;
  };

  const getPlayerScore = (playerName) => {
    return scores[playerName] || 0;
  };

  const getLeadingPlayer = () => {
    if (players.length !== 2) return null;
    const [player1, player2] = players;
    const score1 = getPlayerScore(player1.name);
    const score2 = getPlayerScore(player2.name);
    
    if (score1 > score2) return player1.name;
    if (score2 > score1) return player2.name;
    return null; // empate
  };

  const leadingPlayer = getLeadingPlayer();

  return (
    <Card 
      variant={variant} 
      size="medium" 
      className={`scoreboard ${className}`}
    >
      <div className="scoreboard-header">
        <h3 className="scoreboard-title">
          🏆 Puntajes
        </h3>
      </div>
      
      <div className="players-scores">
        {players.map((player, index) => {
          const playerScore = getPlayerScore(player.name);
          const isCurrentPlayer = player.name === currentPlayer;
          const isLeading = leadingPlayer === player.name;
          
          return (
            <div 
              key={player.name} 
              className={`player-score ${isCurrentPlayer ? 'current-player' : ''} ${isLeading ? 'leading-player' : ''}`}
            >
              <div className="player-info">
                <div className="player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="player-details">
                  <span className="player-name">
                    {getPlayerDisplayName(player)}
                  </span>
                  <span className="player-number">
                    Jugador {index + 1}
                  </span>
                </div>
              </div>
              
              <div className="score-display">
                <span className="score-number">{playerScore}</span>
                <span className="score-label">
                  {gameType === 'dots-boxes' ? 'cajas' : 'puntos'}
                </span>
                {isLeading && playerScore > 0 && (
                  <div className="leading-indicator">
                    👑
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {leadingPlayer && (
        <div className="leader-message">
          {leadingPlayer === currentPlayer ? 
            '🎯 ¡Vas ganando!' : 
            `🏃‍♂️ ${leadingPlayer} va ganando`
          }
        </div>
      )}
    </Card>
  );
};

export default ScoreBoard;
