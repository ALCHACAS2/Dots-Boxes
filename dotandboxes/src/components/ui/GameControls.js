import React from 'react';
import GameInfo from './GameInfo';
import VoiceControls from './VoiceControls';
import GameStatus from './GameStatus';
import ScoreBoard from './ScoreBoard';
import DebugPanel from './DebugPanel';
import './GameControls.css';

const GameControls = ({
    // GameInfo props
    gameTitle,
    gameIcon,
    roomCode,
    players,
    currentPlayer,
    turnIndex,
    gridSize,
    gameType,
    gameFinished,
    scores,
    
    // VoiceControls props
    micEnabled,
    audioEnabled,
    toggleMic,
    toggleAudio,
    isConnecting,
    connectionState,
    forceEnableControls,
    reconnectVoice,
    
    // GameStatus props
    gameEnded,
    winner,
    isDraw,
    onRestart,
    
    // DebugPanel props
    isMyTurn,
    customData,
    showDebug,
    onToggleDebug,
    
    variant = "glass"
}) => {
    return (
        <div className="game-controls">
            <div className="modal-controls-grid">
                <div className="modal-section">
                    <h4 className="modal-section-title">📋 Información del Juego</h4>
                    <GameInfo
                        gameTitle={gameTitle}
                        gameIcon={gameIcon}
                        roomCode={roomCode}
                        players={players}
                        currentPlayer={currentPlayer}
                        turnIndex={turnIndex}
                        gridSize={gridSize}
                        gameType={gameType}
                        gameFinished={gameFinished}
                        scores={scores}
                        variant={variant}
                    />
                </div>

                <div className="modal-section">
                    <h4 className="modal-section-title">🎤 Controles de Voz</h4>
                    <VoiceControls
                        micEnabled={micEnabled}
                        audioEnabled={audioEnabled}
                        toggleMic={toggleMic}
                        toggleAudio={toggleAudio}
                        isConnecting={isConnecting}
                        connectionState={connectionState}
                        forceEnableControls={forceEnableControls}
                        reconnectVoice={reconnectVoice}
                        variant={variant}
                    />
                </div>

                {scores && gameType === 'dots-boxes' && (
                    <div className="modal-section">
                        <h4 className="modal-section-title">🏆 Puntuaciones</h4>
                        <ScoreBoard
                            players={players}
                            scores={scores}
                            currentPlayer={currentPlayer}
                            gameType={gameType}
                            variant={variant}
                        />
                    </div>
                )}

                {gameEnded && (
                    <div className="modal-section">
                        <h4 className="modal-section-title">🎯 Estado del Juego</h4>
                        <GameStatus
                            gameEnded={gameEnded}
                            winner={winner}
                            isDraw={isDraw}
                            currentPlayer={currentPlayer}
                            onRestart={onRestart}
                            gameType={gameType}
                            players={players}
                            scores={scores}
                            variant={variant}
                        />
                    </div>
                )}

                <div className="modal-section modal-section--debug">
                    <DebugPanel
                        players={players}
                        turnIndex={turnIndex}
                        currentPlayer={currentPlayer}
                        isMyTurn={isMyTurn}
                        gameEnded={gameEnded}
                        connectionState={connectionState}
                        isConnecting={isConnecting}
                        micEnabled={micEnabled}
                        audioEnabled={audioEnabled}
                        customData={customData}
                        show={showDebug}
                        onToggle={onToggleDebug}
                        variant={variant}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameControls;
