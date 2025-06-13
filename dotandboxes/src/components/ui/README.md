# Componentes UI Mejorados

Esta librería de componentes UI ha sido creada para mejorar la interfaz del juego Dots & Boxes, proporcionando elementos reutilizables y modernos.

## Componentes Disponibles

### Layout
Contenedor principal con diferentes variantes de fondo.
```jsx
<Layout variant="gaming">
  {children}
</Layout>
```

### Card
Tarjetas con efecto glassmorphism y diferentes variantes.
```jsx
<Card size="large" variant="glass" hover>
  Contenido de la tarjeta
</Card>
```

### Button
Botones con gradientes y múltiples variantes.
```jsx
<Button variant="primary" size="large" icon="🚀" fullWidth>
  Unirse a la sala
</Button>
```

### Input
Campos de entrada con iconos y validación.
```jsx
<Input
  label="Tu nombre:"
  placeholder="Ingresa tu nombre"
  icon="👤"
  variant="glass"
/>
```

### Select
Selectores estilizados con iconos.
```jsx
<Select
  label="Tamaño del tablero:"
  icon="📐"
  variant="glass"
>
  <option value="3">3x3</option>
  <option value="4">4x4</option>
</Select>
```

### Header
Encabezados con gradientes y animaciones.
```jsx
<Header 
  title="Elige un juego" 
  icon="🎮"
  variant="gaming"
  size="large"
/>
```

### GameGrid
Grid de juegos con efectos hover y estados.
```jsx
<GameGrid
  games={gamesList}
  onGameSelect={handleGameSelect}
  variant="gaming"
  columns={3}
/>
```

### PlayerList
Lista de jugadores con avatares y estados.
```jsx
<PlayerList
  players={players}
  currentPlayer={playerName}
  maxPlayers={2}
  variant="glass"
  showWaiting={true}
/>
```

### Alert
Alertas elegantes para notificaciones.
```jsx
<Alert
  variant="success"
  title="¡Éxito!"
  dismissible
  onDismiss={() => setAlert(null)}
>
  Operación completada correctamente
</Alert>
```

### Spinner
Indicadores de carga animados.
```jsx
<Spinner 
  size="medium" 
  variant="primary" 
  text="Cargando..."
/>
```

## Características

- **Responsive**: Todos los componentes son completamente responsivos
- **Glassmorphism**: Efectos de cristal modernos con blur y transparencias
- **Animaciones**: Transiciones suaves y animaciones atractivas
- **Accesibilidad**: Focusable y compatible con lectores de pantalla
- **Tema oscuro**: Soporte automático para modo oscuro
- **Reutilizable**: Componentes modulares y configurables

## Uso

```jsx
import { 
  Layout, 
  Card, 
  Button, 
  Input, 
  Header 
} from './components/ui';

function MyComponent() {
  return (
    <Layout variant="gaming">
      <Card size="large" variant="glass">
        <Header title="Mi App" icon="🎮" />
        <Input label="Nombre" variant="glass" />
        <Button variant="primary" fullWidth>
          Continuar
        </Button>
      </Card>
    </Layout>
  );
}
```

## Estilos

Los componentes incluyen:
- Variables CSS personalizadas para fácil personalización
- Gradientes modernos y efectos visuales
- Animaciones suaves y transiciones
- Sistema de colores consistente
- Tipografía optimizada
