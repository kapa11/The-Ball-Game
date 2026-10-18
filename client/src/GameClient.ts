import { Application } from "pixi.js";

import { Game } from "./Game";
import { Input } from "./input/Input";
import { PlayerInputReader } from "./input/PlayerInputReader";

import { FieldRenderer } from "./render/FieldRenderer";
import { PlayerRenderer } from "./render/PlayerRenderer";
import { BallRenderer } from "./render/BallRenderer";

import { io, Socket } from "socket.io-client";

import type { ServerMessage } from "../../shared/protocol.ts";

export class GameClient {
    readonly game: Game;

    readonly input: Input;
    readonly playerInputReader: PlayerInputReader;

    readonly fieldRenderer: FieldRenderer;
    readonly playerRenderer: PlayerRenderer;
    readonly ballRenderer: BallRenderer;

    readonly socket: Socket;

    constructor(app: Application) {
        this.socket = io("http://localhost:3000");

        this.socket.on("connect", () => {
            console.log("Connected!");
            console.log("Initial transport:", this.socket.io.engine.transport.name);
        });

        this.socket.io.engine.on("upgrade", () => {
            console.log("Upgraded to:", this.socket.io.engine.transport.name);
        });

        this.socket.on("hello", (message) => {
            console.log(message);
        });

        this.socket.on("message", (message: ServerMessage) => {
            if (message.type === "welcome") {
                console.log("Assigned player ID:", message.playerId);
            }

            if (message.type === "state") {
                console.log("Received state:", message.snapshot);
            }
        });

        this.socket.on("playerJoined", (data) => {
            console.log("Player joined:", data.playerId);
        });

        this.socket.on("playerLeft", (data) => {
            console.log("Player left:", data.playerId);
        });
        
        this.game = new Game();

        this.game.addPlayer("local-player", "RED");
        
        this.input = new Input();
        this.playerInputReader = new PlayerInputReader(this.input);

        this.fieldRenderer = new FieldRenderer();
        this.playerRenderer = new PlayerRenderer();
        this.ballRenderer = new BallRenderer();

        app.stage.addChild(this.fieldRenderer);
        app.stage.addChild(this.playerRenderer);
        app.stage.addChild(this.ballRenderer);
    }

    update(dt: number) {
        const playerInput = this.playerInputReader.read();

        this.socket.emit("message", {
            type: "input",
            ...playerInput
        });

        const inputs = new Map([
            ["local-player", playerInput]
        ]);

        const snapshot = this.game.update(dt, inputs);

        const localPlayer = snapshot.players.find(
            player => player.id === "local-player"
        );

        if (localPlayer) {
            this.playerRenderer.sync(localPlayer);
        }
        this.ballRenderer.sync(snapshot.ball);

        this.playerInputReader.endFrame();
    }
}