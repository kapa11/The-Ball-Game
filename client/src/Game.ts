import { Container } from "pixi.js";
import { Field } from "./objects/Field";
import { Player } from "./objects/Player";
import { Input } from "./input/Input";
import { Vector2 } from "./math/Vector2";

export class Game extends Container {

    readonly field: Field;
    readonly player: Player;
    readonly input: Input;

    constructor() {
        super();

        // Create game objects
        this.field = new Field();
        this.player = new Player();
        this.input = new Input();

        // Add them to the scene
        this.addChild(this.field);
        this.addChild(this.player);

        // Initial positions
        this.player.position.set(Field.WORLD_MARGIN_X + 100,Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
    }

    update(dt: number) {
        this.player.update(dt, this.input);
    }
}