import React from 'react';
import Card from './Card';
import Button from './Button';
import './DebugPanel.css';

const DebugPanel = ({
  players = [],
  turnIndex = 0,
  currentPlayer,
  isMyTurn = false,
  gameEnded = false,
  connectionState = 'disconnected',
  isConnecting = false,
  micEnabled = false,
  audioEnabled = false,
  customData = {},
  show = false,
  onToggle,
  variant = 'glass',
  className = ''
}) => {
  const getCurrentPlayerSymbol = () => {
    if (!players || players.length < 2) return '';
    const playerIndex = players.findIndex(p => p.name === currentPlayer);
    return playerIndex === 0 ? 'X' : 'O';
  };

  if (!show) {
    return (
      <div className={`debug-panel-toggle ${className}`}>
        <Button
          variant="ghost"
          size="small"
          onClick={onToggle}
          icon="🔧"
          className="debug-toggle-btn"
        >
          Debug
        </Button>
      </div>
    );
  }

  return (
    <Card 
      variant={variant} 
      size="small" 
      className={`debug-panel ${className}`}
    >
      <div className="debug-header">
        <h4 className="debug-title">🔧 Panel de Debug</h4>
        <Button
          variant="ghost"
          size="small"
          onClick={onToggle}
          icon="✖️"
          className="debug-close-btn"
        >
          Cerrar
        </Button>
      </div>
      
      <div className="debug-content">
        <div className="debug-section">
          <h5>🎮 Estado del Juego</h5>
          <div className="debug-item">
            <span>Turno:</span> 
            <span>{turnIndex} ({players[turnIndex]?.name || 'N/A'})</span>
          </div>
          <div className="debug-item">
            <span>Tu símbolo:</span> 
            <span>{getCurrentPlayerSymbol()}</span>
          </div>
          <div className="debug-item">
            <span>¿Es tu turno?:</span> 
            <span className={isMyTurn ? 'status-yes' : 'status-no'}>
              {isMyTurn ? 'Sí' : 'No'}
            </span>
          </div>
          <div className="debug-item">
            <span>Estado del juego:</span> 
            <span className={gameEnded ? 'status-ended' : 'status-active'}>
              {gameEnded ? 'Terminado' : 'En progreso'}
            </span>
          </div>
        </div>

        <div className="debug-section">
          <h5>🎙️ Estado del Audio</h5>
          <div className="debug-item">
            <span>Conectando:</span> 
            <span className={isConnecting ? 'status-connecting' : 'status-stable'}>
              {isConnecting ? 'Sí' : 'No'}
            </span>
          </div>
          <div className="debug-item">
            <span>Estado:</span> 
            <span className={`status-${connectionState}`}>
              {connectionState}
            </span>
          </div>
          <div className="debug-item">
            <span>Micrófono:</span> 
            <span className={micEnabled ? 'status-enabled' : 'status-disabled'}>
              {micEnabled ? 'Encendido' : 'Apagado'}
            </span>
          </div>
          <div className="debug-item">
            <span>Audio remoto:</span> 
            <span className={audioEnabled ? 'status-enabled' : 'status-disabled'}>
              {audioEnabled ? 'Encendido' : 'Apagado'}
            </span>
          </div>
        </div>

        {Object.keys(customData).length > 0 && (
          <div className="debug-section">
            <h5>📊 Datos Adicionales</h5>
            {Object.entries(customData).map(([key, value]) => (
              <div key={key} className="debug-item">
                <span>{key}:</span>
                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {connectionState === 'failed' && (
          <div className="debug-section debug-warning">
            <h5>⚠️ Conexión de Audio</h5>
            <p>La conexión de audio falló. Usa el botón "Reconectar Audio" en los controles de voz.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DebugPanel;
