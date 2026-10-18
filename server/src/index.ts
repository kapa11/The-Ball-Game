import { Server } from "socket.io";
import type { PlayerInput, ClientMessage, ServerMessage } from "../../shared/protocol.ts";
const io = new Server(3000, {
    cors: {
        origin: "http://localhost:5173"
    }
});

console.log("Socket.io server listening on port 3000");

type PlayerData = {
    input: PlayerInput;
};

const players = new Map<string, PlayerData>();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const playerId = socket.id;
    console.log(`Player joined: ${playerId}`);

    players.set(playerId, {
        input: {
            up: false,
            down: false,
            left: false,
            right: false,
            kick: false
        }
    });
    console.log(`Total connected players: ${players.size}`);

    io.emit("playerJoined", {
        playerId
    });

    socket.emit("message", {
        type: "welcome",
        playerId
    });

    socket.on("message", (message: ClientMessage) => {
        if (message?.type !== "input") {
            return;
        }

        const player = players.get(playerId);

        if (!player) {
            return;
        }

        player.input = {
            up: message.up === true,
            down: message.down === true,
            left: message.left === true,
            right: message.right === true,
            kick: message.kick === true
        };
    });

    const stateInterval = setInterval(() => {
        const player = players.get(playerId);

        if (!player) {
            return;
        }

        socket.emit("message", {
            type: "state",
            input: player.input
        });
    }, 50);

    socket.on("disconnect", (reason) => {
        clearInterval(stateInterval);

        console.log(`Player disconnected: ${playerId}`);
        console.log(`Reason: ${reason}`);

        players.delete(playerId);

        console.log(`Total connected players: ${players.size}`);

        io.emit("playerLeft", {
            playerId
        });
    });
});