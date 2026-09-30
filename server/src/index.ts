import { Server } from "socket.io";

const io = new Server(3000, {
    cors: {
        origin: "http://localhost:5173"
    }
});

console.log("Socket.io server listening on port 3000");

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("hello", "Hello from the server!");

    socket.on("helloBack", (message) => {
        console.log("Client says:", message);
    });
});