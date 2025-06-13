import React from "react";
import { Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";
import DotsBox from "./components/DotsBox";
import TicTacToe from "./components/TicTacToe";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/dotsandboxes" element={<DotsBox />} />
      <Route path="/tic-tac-toe" element={<TicTacToe />} />
    </Routes>
  );
}

export default App;
