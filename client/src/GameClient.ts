import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";

import type { PlayerInput, ServerMessage } from "../../shared/protocol.ts";
import type { SimulationSnapshot } from "../../shared/game/game/SimulationSnapshot.ts";

import { Input } from "./input/Input";
import { PlayerInputReader } from "./input/PlayerInputReader";

import { FieldRenderer } from "./render/FieldRenderer";
import { PlayerRenderer } from "./render/PlayerRenderer";
import { BallRenderer } from "./render/BallRenderer";

export class GameClient {
    private readonly app: Application;

    readonly input: Input;
    readonly playerInputReader: PlayerInputReader;

    readonly fieldRenderer: FieldRenderer;
    readonly playerRenderers = new Map<string, PlayerRenderer>();
    readonly ballRenderer: BallRenderer;

    readonly socket: Socket;

    private latestSnapshot: SimulationSnapshot | null = null;
    private playerId: string | null = null;

    constructor(app: Application) {
        this.app = app;

        // Connect to the game server.
        this.socket = io("http://localhost:3000");

        this.socket.on("connect", () => {
            console.log("Connected to server:", this.socket.id);
        });

        // Receive messages from the server.
        this.socket.on("message", (message: ServerMessage) => {
            if (message.type === "welcome") {
                this.playerId = message.playerId;
                console.log("Assigned player ID:", this.playerId);
            }

            if (message.type === "state") {
                this.latestSnapshot = message.snapshot;

                console.log(
                    "Players:",
                    message.snapshot.players.map(p => ({
                        id: p.id,
                        x: p.x,
                        y: p.y
                    })),
                    "Ball:",
                    message.snapshot.ball
                );
            }
        });

        this.socket.on("playerJoined", (data) => {
            console.log("Player joined:", data.playerId);
        });

        this.socket.on("playerLeft", (data) => {
            console.log("Player left:", data.playerId);

            const renderer = this.playerRenderers.get(data.playerId);

            if (renderer) {
                this.app.stage.removeChild(renderer);
                renderer.destroy();
                this.playerRenderers.delete(data.playerId);
            }
        });

        // Set up input.
        this.input = new Input();
        this.playerInputReader = new PlayerInputReader(this.input);

        // Set up renderers.
        this.fieldRenderer = new FieldRenderer();
        this.ballRenderer = new BallRenderer();

        this.app.stage.addChild(this.fieldRenderer);
        this.app.stage.addChild(this.ballRenderer);
    }

    private addPlayerRenderer(playerId: string): PlayerRenderer {
        const renderer = new PlayerRenderer();

        this.playerRenderers.set(playerId, renderer);
        this.app.stage.addChild(renderer);

        return renderer;
    }

    update(_dt: number) {
        // Read keyboard input and send it to the server.
        const playerInput: PlayerInput = this.playerInputReader.read();

        this.socket.emit("message", {
            type: "input",
            ...playerInput
        });

        // Render only the latest authoritative server snapshot.
        if (this.latestSnapshot !== null) {
            const snapshot = this.latestSnapshot;

            for (const player of snapshot.players) {
                let renderer = this.playerRenderers.get(player.id);

                if (!renderer) {
                    renderer = this.addPlayerRenderer(player.id);
                }

                renderer.sync(player);
            }

            this.ballRenderer.sync(snapshot.ball);
        }

        this.playerInputReader.endFrame();
    }
}