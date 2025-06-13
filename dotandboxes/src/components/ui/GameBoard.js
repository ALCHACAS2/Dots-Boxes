import React from 'react';
import Card from './Card';
import './GameBoard.css';

const GameBoard = ({
    board = Array(9).fill(null),
    onCellClick,
    isMyTurn = false,
    gameEnded = false,
    variant = 'glass',
    className = ''
}) => {
    const renderCell = (position) => {
        const value = board[position];
        return (
            <div
                key={position}
                className={`cell ${value ? 'filled' : ''} ${value === 'X' ? 'x' : value === 'O' ? 'o' : ''}`}
                onClick={() => onCellClick(position)}
                style={{
                    cursor: isMyTurn && !value && !gameEnded ? 'pointer' : 'default'
                }}
            >
                {value && <span className="symbol">{value}</span>}
            </div>
        );
    };

    return (
        <Card
            variant={variant}
            size="large"
            className={`game-board-card ${className}`}
        >
            <div className="board-container">
                <div className="board tic-tac-toe-board">
                    {Array.from({ length: 9 }, (_, index) => renderCell(index))}
                </div>
            </div>
        </Card>
    );
};

export default GameBoard;
