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
    socket.on("playersUpdate", (updatedPlayers) => {
      console.log("Jugadores actualizados:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("startGame", (data) => {
      console.log("Recibido startGame:", data);
      navigate("/game", {
        state: {
          playerName,
          roomCode,
          players: data.players, // ← ¡Cambio aquí!
        },
      });
    });

    socket.on("roomFull", () => {
      alert("La sala está llena.");
    });

    return () => {
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("playersUpdate");
    };
  }, [socket, navigate, playerName, roomCode]);

  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    console.log("Intentando unirse a sala:", { roomCode, playerName });
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

      {players.length > 0 && (
        <div>
          <h3>Jugadores en la sala:</h3>
          {players.map((player, index) => (
            <div key={index}>{player.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lobby;
