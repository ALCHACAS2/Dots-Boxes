// src/contexts/SocketContext.js
import React, { createContext, useContext } from "react";
import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SERVER_UR || "http://localhost:3001";

const socket = io(URL, {
  transports: ["websocket"],
});

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket debe usarse dentro de un SocketProvider");
  }
  return context;
};