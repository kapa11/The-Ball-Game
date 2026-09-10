import { Input } from "./input/Input";
import type { PlayerInput } from "./input/PlayerInput";
import { PlayerInputReader } from "./input/PlayerInputReader";

import { FieldRenderer } from "./render/FieldRenderer";
import { PlayerRenderer } from "./render/PlayerRenderer";
import { BallRenderer } from "./render/BallRenderer";

import { Application } from "pixi.js"; //Application = central object managing renderer, canvas, scene
const app = new Application();

await app.init({
    width: 1400, //size of entire game canvas...
    height: 800, //...not only size of field
    backgroundColor: 0x111111,
});

document.body.appendChild(app.canvas); //canvas created, add as part of HTML page

import { Game } from "./Game";

const game = new Game();
const fieldRenderer = new FieldRenderer();
const playerRenderer = new PlayerRenderer();
const ballRenderer = new BallRenderer();

app.stage.addChild(fieldRenderer);
app.stage.addChild(playerRenderer);
app.stage.addChild(ballRenderer);
//app.stage.addChild(game);

const input = new Input();
const playerInputReader = new PlayerInputReader(input);

app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;

    const playerInput = playerInputReader.read();

    game.update(dt, playerInput);

    playerRenderer.sync(game.player);
    ballRenderer.sync(game.ball);

    playerInputReader.endFrame();
});