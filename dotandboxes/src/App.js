import React from "react";
import { Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import TicTacToe from "./components/TicTacToe";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/game" element={<GameBoard />} />
      <Route path="/tic-tac-toe" element={<TicTacToe />} />
    </Routes>
  );
}

export default App;
