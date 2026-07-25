import { Application } from "pixi.js"; //Application = central object managing renderer, canvas, scene
import { Field } from "./objects/Field";
const app = new Application();

await app.init({
    width: 1400, //size of entire game canvas...
    height: 1000, //...not only size of field
    backgroundColor: 0x111111,
});

document.body.appendChild(app.canvas); //canvas created, add as part of HTML page

const field = new Field();

app.stage.addChild(field);