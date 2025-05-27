// src/socket.js
import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";
console.log("prue")
console.log(URL)
console.log("ba")
const socket = io(URL, {
  transports: ["websocket"],
});

export default socket;
