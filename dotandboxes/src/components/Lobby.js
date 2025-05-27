// src/components/Lobby.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
  socket.on("startGame", () => {
    console.log("Recibido startGame");
    navigate("/game", {
      state: {
        playerName,
        roomCode,
      },
    });
  });

  socket.on("roomFull", () => {
    alert("La sala está llena.");
  });

  return () => {
    socket.off("startGame");
    socket.off("roomFull");
  };
}, []);


  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    socket.emit("joinRoom", { roomCode, name: playerName });
  };

  return (
    <div>
      <h2>Lobby</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Código de sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={handleJoin}>Unirse</button>
    </div>
  );
}

export default Lobby;
