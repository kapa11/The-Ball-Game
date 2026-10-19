import { Server } from "socket.io";
import type { PlayerInput, ClientMessage, ServerMessage } from "../../shared/protocol.ts";
import { Game } from "../../shared/game/Game.ts";
import type { PlayerInputs, Team } from "../../shared/game/game/PlayerData.ts";

const io = new Server(3000, {
    cors: {
        origin: "http://localhost:5173"
    }
});

console.log("Socket.io server listening on port 3000");
const TICK_RATE = 60;
const BROADCAST_INTERVAL = 50;

let lastBroadcastTime = 0;

setInterval(() => {
    const dt = 1 / TICK_RATE;

    // Advance the authoritative simulation.
    const snapshot = game.update(dt, inputs);

    // Broadcast snapshots at approximately 20 Hz.
    const now = Date.now();

    if (now - lastBroadcastTime >= BROADCAST_INTERVAL) {
        io.emit("message", {
            type: "state",
            snapshot
        });

        lastBroadcastTime = now;
    }
}, 1000 / TICK_RATE);

type PlayerData = {
    input: PlayerInput;
};

const players = new Map<string, PlayerData>();
const game = new Game();
const inputs: PlayerInputs = new Map<string, PlayerInput>();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const playerId = socket.id;
    const team: Team = players.size % 2 === 0 ? "RED" : "BLUE";

    game.addPlayer(playerId, team);

    inputs.set(playerId, {
        up: false,
        down: false,
        left: false,
        right: false,
        kick: false
    });

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

        inputs.set(playerId, player.input);

        if (message.up || message.down || message.left || message.right || message.kick) {
            console.log("Input received:", playerId, player.input);
        }
    });


    socket.on("disconnect", (reason) => {
    
        console.log(`Player disconnected: ${playerId}`);
        console.log(`Reason: ${reason}`);

        players.delete(playerId);
        game.players.delete(playerId);
        inputs.delete(playerId);

        console.log(`Total connected players: ${players.size}`);

        io.emit("playerLeft", {
            playerId
        });
    });
});