import { Application } from "pixi.js"; //Application = central object managing renderer, canvas, scene
const app = new Application();

await app.init({
    width: 1400, //size of entire game canvas...
    height: 1000, //...not only size of field
    backgroundColor: 0x111111,
});

document.body.appendChild(app.canvas); //canvas created, add as part of HTML page

import { Game } from "./Game";

const game = new Game();

app.stage.addChild(game);

app.ticker.add((ticker) => {
    game.update(ticker.deltaMS / 1000);
});