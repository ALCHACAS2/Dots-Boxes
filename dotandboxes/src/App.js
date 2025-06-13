import React from "react";
import { Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";
import DotsBox from "./components/DotsBox";
import TicTacToe from "./components/TicTacToe";
import DotsBoxTest from "./pruebas/DotsBoxTest";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/dotsandboxes" element={<DotsBox />} />
      <Route path="/tic-tac-toe" element={<TicTacToe />} />
      <Route path="/test-dotsbox" element={<DotsBoxTest />} />
    </Routes>
  );
}

export default App;
