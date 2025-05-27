// src/components/GameBoard.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../socket";

const GRID_SIZE = 3; // Tamaño del tablero (3x3 cajas)

const GameBoard = () => {
    const location = useLocation();
    const { playerName, roomCode, players = [] } = location.state || {};

    const [horizontalLines, setHorizontalLines] = useState(
        Array(GRID_SIZE + 1).fill(null).map(() => Array(GRID_SIZE).fill(false))
    );
    const [verticalLines, setVerticalLines] = useState(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE + 1).fill(false))
    );
    const [boxes, setBoxes] = useState(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [turnIndex, setTurnIndex] = useState(0);
    const [scores, setScores] = useState({});
    const [opponentName, setOpponentName] = useState("Tu oponente");

    useEffect(() => {
        if (players.length === 2) {
            const opponent = players.find(p => p.name !== playerName);
            if (opponent) setOpponentName(opponent.name);
            setScores({ [players[0].name]: 0, [players[1].name]: 0 });
        }
    }, [players, playerName]);

    const isMyTurn = players.length === 2 && players[turnIndex]?.name === playerName;

    useEffect(() => {
        socket.on("opponent_move", (move) => {
            handleMove(move, false); // false = no soy yo
        });

        return () => {
            socket.off("opponent_move");
        };
    }, []);

    const handleMove = (move, isLocal) => {
        const { type, row, col } = move;
        let updated = false;
        let newHorizontal = [...horizontalLines.map(row => [...row])];
        let newVertical = [...verticalLines.map(row => [...row])];
        let newBoxes = [...boxes.map(row => [...row])];
        let newScores = { ...scores };
        let boxCompleted = false;

        if (type === "h" && !horizontalLines[row][col]) {
            newHorizontal[row][col] = true;
            updated = true;
        } else if (type === "v" && !verticalLines[row][col]) {
            newVertical[row][col] = true;
            updated = true;
        }

        if (!updated) return;

        const currentPlayer = players[turnIndex].name;

        // Verifica si se cerró alguna caja
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (
                    newHorizontal[r][c] &&
                    newHorizontal[r + 1][c] &&
                    newVertical[r][c] &&
                    newVertical[r][c + 1] &&
                    !newBoxes[r][c]
                ) {
                    newBoxes[r][c] = currentPlayer;
                    newScores[currentPlayer] = (newScores[currentPlayer] || 0) + 1;
                    boxCompleted = true;
                }
            }
        }

        setHorizontalLines(newHorizontal);
        setVerticalLines(newVertical);
        setBoxes(newBoxes);
        setScores(newScores);

        if (!boxCompleted) {
            setTurnIndex((prev) => 1 - prev);
        }
    };

    const handleClick = (type, row, col) => {
        if (!isMyTurn) return;

        const move = { type, row, col };

        handleMove(move, true);
        const normalizedRoomCode = roomCode.trim().toLowerCase();
        socket.emit("joinRoom", { roomCode: normalizedRoomCode, name: playerName });

    };

    const renderBoard = () => {
        const board = [];

        for (let r = 0; r < GRID_SIZE * 2 + 1; r++) {
            const row = [];
            for (let c = 0; c < GRID_SIZE * 2 + 1; c++) {
                if (r % 2 === 0 && c % 2 === 0) {
                    row.push(<div key={`${r}-${c}`} className="dot" />);
                } else if (r % 2 === 0) {
                    const rowIndex = r / 2;
                    const colIndex = (c - 1) / 2;
                    const active = horizontalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`line horizontal ${active ? "active" : ""}`}
                            onClick={() => handleClick("h", rowIndex, colIndex)}
                        />
                    );
                } else if (c % 2 === 0) {
                    const rowIndex = (r - 1) / 2;
                    const colIndex = c / 2;
                    const active = verticalLines[rowIndex][colIndex];
                    row.push(
                        <div
                            key={`${r}-${c}`}
                            className={`line vertical ${active ? "active" : ""}`}
                            onClick={() => handleClick("v", rowIndex, colIndex)}
                        />
                    );
                } else {
                    const boxOwner = boxes[(r - 1) / 2][(c - 1) / 2];
                    row.push(
                        <div key={`${r}-${c}`} className="box">
                            {boxOwner ? boxOwner.charAt(0).toUpperCase() : ""}
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

    if (!players || players.length < 2) {
        return <div>Esperando a que otro jugador se una...</div>;
    }

    return (
        <div className="game-container">
            <h2>Turno de: {isMyTurn ? "Tú" : opponentName}</h2>
            <div className="scores">
                {players.map((p) => (
                    <div key={p.name}>
                        {p.name}: {scores[p.name] || 0} puntos
                    </div>
                ))}
            </div>
            <div className="board">{renderBoard()}</div>
        </div>
    );
};

export default GameBoard;
