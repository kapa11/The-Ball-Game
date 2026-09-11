import { Application } from "pixi.js";
import { GameClient } from "./GameClient";

const app = new Application();

await app.init({
    width: 1400,
    height: 800,
    backgroundColor: 0x111111,
});

document.body.appendChild(app.canvas);

const gameClient = new GameClient(app);

app.ticker.add((ticker) => {
    gameClient.update(ticker.deltaMS / 1000);
});