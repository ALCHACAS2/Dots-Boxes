// src/pruebas/DotsBoxTest.js
import React, { useState, useEffect } from "react";
import { DotsBoxBoard, Layout, Card, Button, Input } from "../components/ui";
import "./DotsBoxTest.css";

const DotsBoxTest = () => {
    const [gridSize, setGridSize] = useState(3);
    const [inputValue, setInputValue] = useState("3");
    const [horizontalLines, setHorizontalLines] = useState([]);
    const [verticalLines, setVerticalLines] = useState([]);
    const [boxes, setBoxes] = useState([]);

    // Inicializar arrays basados en el tamaño de cuadrícula
    const initializeGrid = (size) => {
        setHorizontalLines(Array(size + 1).fill(null).map(() => Array(size).fill(false)));
        setVerticalLines(Array(size).fill(null).map(() => Array(size + 1).fill(false)));
        setBoxes(Array(size).fill(null).map(() => Array(size).fill(null)));
    };

    useEffect(() => {
        initializeGrid(gridSize);
    }, [gridSize]);

    const handleUpdateSize = () => {
        const newSize = parseInt(inputValue);
        if (newSize && newSize >= 2 && newSize <= 20) {
            setGridSize(newSize);
        } else {
            alert("Por favor ingresa un tamaño entre 2 y 20");
        }
    };

    const handleLineClick = (type, row, col) => {
        console.log(`Línea clickeada: ${type} en [${row}][${col}]`);
        
        if (type === "h") {
            const newHorizontal = [...horizontalLines];
            newHorizontal[row][col] = !newHorizontal[row][col];
            setHorizontalLines(newHorizontal);
        } else if (type === "v") {
            const newVertical = [...verticalLines];
            newVertical[row][col] = !newVertical[row][col];
            setVerticalLines(newVertical);
        }
    };

    const resetGrid = () => {
        initializeGrid(gridSize);
    };

    const fillRandomLines = () => {
        const newHorizontal = [...horizontalLines];
        const newVertical = [...verticalLines];
        
        // Llenar algunas líneas al azar
        for (let i = 0; i < gridSize + 1; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (Math.random() > 0.7) {
                    newHorizontal[i][j] = true;
                }
            }
        }
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize + 1; j++) {
                if (Math.random() > 0.7) {
                    newVertical[i][j] = true;
                }
            }
        }
        
        setHorizontalLines(newHorizontal);
        setVerticalLines(newVertical);
    };

    return (
        <Layout variant="gaming">
            <div className="dots-box-test">
                <Card variant="glass" className="test-controls">
                    <h1>🎯 Pruebas de Tamaño - Dots & Boxes</h1>
                    
                    <div className="size-controls">
                        <div className="input-group">
                            <label htmlFor="gridSizeInput">Tamaño del Grid:</label>
                            <Input
                                id="gridSizeInput"
                                type="number"
                                min="2"
                                max="20"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ej: 3, 5, 10..."
                                variant="glass"
                            />
                            <Button
                                onClick={handleUpdateSize}
                                variant="primary"
                                size="medium"
                            >
                                🔄 Actualizar
                            </Button>
                        </div>
                        
                        <div className="current-size">
                            <strong>Tamaño actual: {gridSize}x{gridSize}</strong>
                            <span>({gridSize * gridSize} cajas total)</span>
                        </div>
                        
                        <div className="action-buttons">
                            <Button
                                onClick={resetGrid}
                                variant="secondary"
                                size="small"
                            >
                                🧹 Limpiar
                            </Button>
                            <Button
                                onClick={fillRandomLines}
                                variant="accent"
                                size="small"
                            >
                                🎲 Aleatorio
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="test-board">
                    <DotsBoxBoard
                        gridSize={gridSize}
                        horizontalLines={horizontalLines}
                        verticalLines={verticalLines}
                        boxes={boxes}
                        onLineClick={handleLineClick}
                        isMyTurn={true}
                        players={[{ name: "Tester" }]}
                        currentPlayer="Tester"
                        variant="glass"
                    />
                </div>

                <Card variant="glass" className="test-info">
                    <h3>📏 Información del Test</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Grid Size:</span>
                            <span className="value">{gridSize}x{gridSize}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Total Cajas:</span>
                            <span className="value">{gridSize * gridSize}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Líneas H:</span>
                            <span className="value">{(gridSize + 1) * gridSize}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Líneas V:</span>
                            <span className="value">{gridSize * (gridSize + 1)}</span>
                        </div>
                    </div>
                    
                    <div className="test-instructions">
                        <h4>📋 Instrucciones:</h4>
                        <ul>
                            <li>Cambia el tamaño en el input y presiona "Actualizar"</li>
                            <li>Haz clic en las líneas para probar la interactividad</li>
                            <li>Usa "Limpiar" para resetear el tablero</li>
                            <li>Usa "Aleatorio" para llenar algunas líneas automáticamente</li>
                            <li>Prueba diferentes tamaños: 3x3, 5x5, 10x10, 15x15, etc.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default DotsBoxTest;
