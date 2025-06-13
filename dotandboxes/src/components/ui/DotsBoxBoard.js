import React from 'react';
import Card from './Card';
import './DotsBoxBoard.css';

const DotsBoxBoard = ({
    gridSize = 3,
    horizontalLines = [],
    verticalLines = [],
    boxes = [],
    onLineClick,
    isMyTurn = false,
    players = [],
    currentPlayer,
    variant = 'glass',
    className = ''
}) => {
    const getPlayerNumber = (playerName) => {
        if (!players || players.length < 2) return null;
        const playerIndex = players.findIndex(p => p.name === playerName);
        return playerIndex + 1;
    };

    const renderBoard = () => {
        const board = [];

        for (let r = 0; r < gridSize * 2 + 1; r++) {
            const row = [];
            for (let c = 0; c < gridSize * 2 + 1; c++) {
                if (r % 2 === 0 && c % 2 === 0) {
                    // Puntos (dots)
                    row.push(<div key={`${r}-${c}`} className="dot" />);
                } else if (r % 2 === 0) {
                    // Líneas horizontales
                    const rowIndex = r / 2;
                    const colIndex = (c - 1) / 2;
                    const isActive = horizontalLines[rowIndex] && horizontalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`h-line ${isActive ? "taken" : ""} ${isMyTurn && !isActive ? "clickable" : ""}`}
                            onClick={() => onLineClick("h", rowIndex, colIndex)}
                            style={{
                                cursor: isMyTurn && !isActive ? "pointer" : "default"
                            }}
                        />
                    );
                } else if (c % 2 === 0) {
                    // Líneas verticales
                    const rowIndex = (r - 1) / 2;
                    const colIndex = c / 2;
                    const isActive = verticalLines[rowIndex] && verticalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`v-line ${isActive ? "taken" : ""} ${isMyTurn && !isActive ? "clickable" : ""}`}
                            onClick={() => onLineClick("v", rowIndex, colIndex)}
                            style={{
                                cursor: isMyTurn && !isActive ? "pointer" : "default"
                            }}
                        />
                    );
                } else {
                    // Cajas
                    const boxRow = (r - 1) / 2;
                    const boxCol = (c - 1) / 2;
                    const boxOwner = boxes[boxRow] && boxes[boxRow][boxCol];
                    const playerNumber = boxOwner ? getPlayerNumber(boxOwner) : null;

                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`box ${boxOwner ? `player${playerNumber}` : ''} ${boxOwner === currentPlayer ? 'owned-by-me' : ''}`}
                        >
                            {boxOwner && (
                                <div className="box-content">
                                    <span className="box-initial">
                                        {boxOwner.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                }
            }
            board.push(
                <div key={r} className="board-row">
                    {row}
                </div>
            );
        }

        return board;
    };

    return (
        <Card
            variant={variant}
            size="large"
            className={`dots-box-board-card ${className}`}
        >
            <div className="board-container">
                <div className={`dots-box-board grid-${gridSize}`}>
                    {renderBoard()}
                </div>
            </div>
        </Card>
    );
};

export default DotsBoxBoard;
