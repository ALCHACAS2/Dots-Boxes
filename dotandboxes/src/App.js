import React from "react";
import { Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/game" element={<GameBoard />} />
    </Routes>
  );
}

export default App;
