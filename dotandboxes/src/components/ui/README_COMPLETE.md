# Librería de Componentes UI - Juegos de Mesa 🎮

Esta librería contiene componentes reutilizables diseñados específicamente para crear interfaces de juegos de mesa elegantes y modernas. Todos los componentes han sido optimizados para UX/UI y cuentan con efectos glassmorphism, animaciones suaves y diseño responsive.

## 📦 Componentes Base

### 🏗️ Layout
Contenedor principal para las páginas de juego con fondos animados.
```jsx
import { Layout } from './ui';

<Layout variant="gaming">
  {children}
</Layout>
```

### 📇 Card
Tarjeta con efecto glassmorphism para agrupar contenido elegantemente.
```jsx
import { Card } from './ui';

<Card variant="glass" size="medium" hover>
  {children}
</Card>
```

### 🔘 Button
Botón moderno con gradientes, íconos y estados de carga.
```jsx
import { Button } from './ui';

<Button 
  variant="primary" 
  size="medium" 
  icon="🎮"
  loading={false}
  onClick={handleClick}
>
  Jugar
</Button>
```

### 📝 Input
Campo de entrada con label, íconos, validación y helper text.
```jsx
import { Input } from './ui';

<Input
  label="Nombre de Jugador"
  placeholder="Escribe tu nombre"
  error={error}
  helper="Mínimo 3 caracteres"
  icon="👤"
  variant="glass"
/>
```

### 📋 Select
Selector dropdown estilizado con opciones personalizables.
```jsx
import { Select } from './ui';

<Select
  label="Tamaño del tablero"
  icon="📐"
  options={[
    { value: 3, label: '3x3' },
    { value: 4, label: '4x4' },
    { value: 5, label: '5x5' }
  ]}
  value={selectedSize}
  onChange={setSelectedSize}
/>
```

## 🎲 Componentes de Juego

### 📊 GameInfo
Muestra información general del juego (título, sala, jugadores, estado).
```jsx
import { GameInfo } from './ui';

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
```

### 🎯 TurnIndicator
Indica de quién es el turno actual con animaciones llamativas.
```jsx
import { TurnIndicator } from './ui';

<TurnIndicator
  isMyTurn={isMyTurn}
  currentPlayerName={currentPlayerName}
  currentPlayer={playerName}
  playerSymbol="X"
  gameType="tic-tac-toe"
  variant="glass"
/>
```

### 🏆 ScoreBoard
Tablero de puntuaciones animado para juegos como Dots & Boxes.
```jsx
import { ScoreBoard } from './ui';

<ScoreBoard
  players={players}
  scores={scores}
  currentPlayer={playerName}
  gameType="dots-boxes"
  variant="glass"
/>
```

### 🎯 GameBoard
Tablero interactivo específico para Tic Tac Toe con animaciones.
```jsx
import { GameBoard } from './ui';

<GameBoard
  board={board}
  onCellClick={handleCellClick}
  isMyTurn={isMyTurn}
  gameEnded={gameEnded}
  variant="glass"
/>
```

### ⚪ DotsBoxBoard
Tablero específico para Dots & Boxes con puntos y líneas interactivas.
```jsx
import { DotsBoxBoard } from './ui';

<DotsBoxBoard
  gridSize={gridSize}
  horizontalLines={horizontalLines}
  verticalLines={verticalLines}
  boxes={boxes}
  onLineClick={handleLineClick}
  isMyTurn={isMyTurn}
  players={players}
  currentPlayer={playerName}
  variant="glass"
/>
```

### 🎙️ VoiceControls
Controles completos para chat de voz durante el juego.
```jsx
import { VoiceControls } from './ui';

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
```

### 🏁 GameStatus
Muestra el estado final del juego y controles para reiniciar.
```jsx
import { GameStatus } from './ui';

<GameStatus
  gameEnded={gameEnded}
  winner={winner}
  isDraw={isDraw}
  currentPlayer={playerName}
  onRestart={handleRestart}
  gameType="tic-tac-toe"
  players={players}
  scores={scores}
  variant="glass"
/>
```

### ⏳ WaitingRoom
Sala de espera elegante mientras llegan más jugadores.
```jsx
import { WaitingRoom } from './ui';

<WaitingRoom
  playerName={playerName}
  roomCode={roomCode}
  players={players}
  maxPlayers={2}
  gameType="tic-tac-toe"
  variant="glass"
/>
```

### 🔧 DebugPanel
Panel de debug desplegable para desarrollo y testing.
```jsx
import { DebugPanel } from './ui';

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
    'Winner': winner
  }}
  show={showDebug}
  onToggle={() => setShowDebug(!showDebug)}
  variant="glass"
/>
```

## 🛠️ Componentes Utilitarios

### 📰 Header
Encabezado con título, icono y diferentes variantes.
```jsx
import { Header } from './ui';

<Header 
  title="Mi Juego"
  icon="🎮"
  variant="gaming"
  size="large"
/>
```

### 👥 PlayerList
Lista animada de jugadores conectados con avatares.
```jsx
import { PlayerList } from './ui';

<PlayerList
  players={players}
  currentPlayer={playerName}
  maxPlayers={4}
  variant="glass"
/>
```

### 🚨 Alert
Alertas y notificaciones con auto-cierre y animaciones.
```jsx
import { Alert } from './ui';

<Alert
  type="success"
  title="¡Conectado!"
  message="Te has unido al juego exitosamente"
  onClose={handleClose}
  autoClose={3000}
/>
```

### ⏳ Spinner
Indicador de carga animado con mensajes.
```jsx
import { Spinner } from './ui';

<Spinner 
  size="large"
  color="primary"
  message="Conectando..."
/>
```

### 📐 GameGrid
Grid responsive para elementos de juego.
```jsx
import { GameGrid } from './ui';

<GameGrid
  columns={3}
  gap="medium"
  responsive
>
  {gridItems}
</GameGrid>
```

## 🎨 Variantes de Diseño

Todos los componentes soportan las siguientes variantes:

- **`glass`**: Efecto glassmorphism con transparencia y blur (por defecto)
- **`solid`**: Fondo sólido con colores vibrantes
- **`outlined`**: Solo borde con fondo transparente
- **`ghost`**: Fondo completamente transparente

## 📏 Tamaños Disponibles

Los componentes soportan diferentes tamaños:

- **`small`**: Compacto para espacios reducidos
- **`medium`**: Estándar para uso general (por defecto)
- **`large`**: Grande para elementos destacados

## 🎨 Personalización y Temas

Los componentes están diseñados con variables CSS que permiten fácil personalización:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --backdrop-blur: 10px;
  
  --animation-duration: 0.3s;
  --border-radius: 12px;
}
```

## 🚀 Implementación Completa

### Ejemplo: TicTacToe
```jsx
import React, { useState } from 'react';
import {
  Layout,
  GameInfo,
  VoiceControls,
  TurnIndicator,
  GameBoard,
  GameStatus,
  WaitingRoom,
  DebugPanel
} from './ui';

const TicTacToe = () => {
  const [showDebug, setShowDebug] = useState(false);
  // ... otros estados del juego

  if (players.length < 2) {
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
  }

  return (
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
            currentPlayerName={currentPlayerName}
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
```

### Ejemplo: DotsBox
```jsx
import React, { useState } from 'react';
import {
  Layout,
  GameInfo,
  VoiceControls,
  TurnIndicator,
  ScoreBoard,
  DotsBoxBoard,
  GameStatus,
  WaitingRoom,
  DebugPanel
} from './ui';

const DotsBox = () => {
  const [showDebug, setShowDebug] = useState(false);
  // ... otros estados del juego

  if (players.length < 2) {
    return (
      <Layout variant="gaming">
        <WaitingRoom
          playerName={playerName}
          roomCode={roomCode}
          players={players}
          maxPlayers={2}
          gameType="dots-boxes"
          gridSize={gridSize}
          variant="glass"
        />
      </Layout>
    );
  }

  return (
    <Layout variant="gaming">
      <div className="dots-box-game">
        <GameInfo
          gameTitle="Dots & Boxes"
          gameIcon="⚪"
          roomCode={roomCode}
          players={players}
          currentPlayer={playerName}
          turnIndex={turnIndex}
          gridSize={gridSize}
          gameType="dots-boxes"
          gameFinished={gameFinished}
          scores={scores}
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

        {!gameFinished && (
          <TurnIndicator
            isMyTurn={isMyTurn}
            currentPlayerName={currentPlayerName}
            currentPlayer={playerName}
            gameType="dots-boxes"
            variant="glass"
          />
        )}

        <ScoreBoard
          players={players}
          scores={scores}
          currentPlayer={playerName}
          gameType="dots-boxes"
          variant="glass"
        />

        <DotsBoxBoard
          gridSize={gridSize}
          horizontalLines={horizontalLines}
          verticalLines={verticalLines}
          boxes={boxes}
          onLineClick={handleLineClick}
          isMyTurn={isMyTurn}
          players={players}
          currentPlayer={playerName}
          variant="glass"
        />

        {gameFinished && (
          <GameStatus
            gameEnded={gameFinished}
            winner={getWinner()}
            isDraw={false}
            currentPlayer={playerName}
            onRestart={handleRestart}
            gameType="dots-boxes"
            players={players}
            scores={scores}
            variant="glass"
          />
        )}

        <DebugPanel
          players={players}
          turnIndex={turnIndex}
          currentPlayer={playerName}
          isMyTurn={isMyTurn}
          gameEnded={gameFinished}
          connectionState={connectionState}
          isConnecting={isConnecting}
          micEnabled={micEnabled}
          audioEnabled={audioEnabled}
          customData={{
            'Grid Size': `${gridSize}x${gridSize}`,
            'Completed Boxes': `${completedBoxes}/${totalBoxes}`,
            'Scores': JSON.stringify(scores)
          }}
          show={showDebug}
          onToggle={() => setShowDebug(!showDebug)}
          variant="glass"
        />
      </div>
    </Layout>
  );
};
```

## ✨ Características Destacadas

- **🎨 Diseño Glassmorphism**: Efectos modernos de transparencia y blur
- **📱 Responsive**: Adaptable a dispositivos móviles y desktop
- **🎭 Animaciones Suaves**: Transiciones y animaciones CSS optimizadas
- **🎯 Específicos para Juegos**: Componentes diseñados para gaming
- **🔧 Desarrollo Friendly**: Panel de debug integrado
- **🎙️ Chat de Voz**: Controles completos para comunicación
- **⚡ Performance**: Optimizado para renderizado rápido
- **🛠️ Modular**: Componentes independientes y reutilizables

## 🤝 Contribución

Para añadir nuevos componentes:

1. Crear el archivo `.js` y `.css` en `/src/components/ui/`
2. Exportar el componente en `index.js`
3. Seguir las convenciones de naming y props
4. Añadir documentación en este README
5. Asegurar responsividad y accesibilidad
6. Incluir animaciones y efectos glassmorphism
7. Testear en diferentes dispositivos

## 📝 Changelog

### v2.0.0 - Refactorización Completa
- ✅ Separación completa de lógica de interfaz
- ✅ Nuevos componentes específicos para juegos
- ✅ Mejoras en UX/UI con glassmorphism
- ✅ Sistema de animaciones mejorado
- ✅ Panel de debug integrado
- ✅ Componentes TurnIndicator y ScoreBoard
- ✅ Tableros específicos para cada juego
- ✅ Responsive design optimizado
