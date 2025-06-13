import React from 'react';
import { Card, Button, Alert } from '../ui';
import './VoiceControls.css';

const VoiceControls = ({
  micEnabled,
  audioEnabled,
  toggleMic,
  toggleAudio,
  isConnecting,
  connectionState,
  forceEnableControls,
  reconnectVoice,
  variant = 'glass',
  size = 'medium'
}) => {
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return { icon: '🟢', text: 'Conectado', color: 'success' };
      case 'failed':
        return { icon: '🔴', text: 'Error de conexión', color: 'error' };
      case 'disconnected':
        return { icon: '🟡', text: 'Desconectado', color: 'warning' };
      default:
        return { icon: '⚪', text: 'Conectando...', color: 'info' };
    }
  };

  const status = getConnectionStatus();

  return (
    <Card variant={variant} size={size} className="voice-controls-card">
      <div className="voice-header">
        <h4 className="voice-title">🎙️ Control de Voz</h4>
        <div className={`connection-status status--${status.color}`}>
          <span className="status-icon">{status.icon}</span>
          <span className="status-text">{status.text}</span>
        </div>
      </div>

      {/* Indicadores de estado */}
      <div className="status-indicators">
        <div className={`mic-indicator ${micEnabled ? 'active' : 'inactive'}`}>
          <span className="indicator-icon">
            {micEnabled ? '🎙️' : '🔇'}
          </span>
          <span className="indicator-text">
            Micrófono: {micEnabled ? 'Activo' : 'Desactivado'}
          </span>
        </div>

        <div className={`audio-indicator ${audioEnabled ? 'active' : 'inactive'}`}>
          <span className="indicator-icon">
            {audioEnabled ? '🔊' : '🔈'}
          </span>
          <span className="indicator-text">
            Audio: {audioEnabled ? 'Activo' : 'Desactivado'}
          </span>
        </div>
      </div>

      {/* Controles principales */}
      <div className="voice-buttons">
        <Button
          variant={micEnabled ? 'success' : 'outline'}
          size="medium"
          onClick={toggleMic}
          disabled={isConnecting}
          icon={micEnabled ? '🔇' : '🎙️'}
          fullWidth
        >
          {micEnabled ? 'Silenciar Micrófono' : 'Activar Micrófono'}
        </Button>

        <Button
          variant={audioEnabled ? 'warning' : 'outline'}
          size="medium"
          onClick={toggleAudio}
          disabled={isConnecting}
          icon={audioEnabled ? '🔈' : '🔊'}
          fullWidth
        >
          {audioEnabled ? 'Silenciar Audio' : 'Activar Audio'}
        </Button>
      </div>

      {/* Botón de reconexión cuando falla */}
      {connectionState === 'failed' && (
        <div className="reconnect-section">
          <Alert variant="error" size="small">
            <strong>Conexión perdida</strong><br />
            La conexión de voz falló. Puedes intentar reconectar.
          </Alert>
          <Button
            variant="danger"
            size="medium"
            onClick={reconnectVoice}
            disabled={isConnecting}
            icon="🔄"
            fullWidth
          >
            Reconectar Audio
          </Button>
        </div>
      )}

      {/* Botón de emergencia para desbloquear controles */}
      {isConnecting && (
        <div className="emergency-section">
          <Alert variant="warning" size="small">
            Si los controles se quedan bloqueados, usa el botón de emergencia:
          </Alert>
          <Button
            variant="minimal"
            size="small"
            onClick={forceEnableControls}
            icon="🚨"
            fullWidth
          >
            Forzar Habilitación
          </Button>
        </div>
      )}

      {/* Mensaje informativo */}
      {!micEnabled && !isConnecting && (
        <Alert variant="info" size="small" className="mic-info">
          💡 Tu micrófono está desactivado por defecto. Haz clic en "Activar Micrófono" para hablar con tu oponente.
        </Alert>
      )}

      {/* Indicador de carga */}
      {isConnecting && (
        <div className="connecting-indicator">
          <div className="loading-spinner"></div>
          <span>Conectando audio...</span>
        </div>
      )}
    </Card>
  );
};

export default VoiceControls;
