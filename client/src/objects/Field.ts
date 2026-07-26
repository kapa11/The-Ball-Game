import { Graphics } from "pixi.js";

export class Field extends Graphics {
    static readonly WIDTH = 945;
    static readonly HEIGHT = 612;

    constructor() {
        // Initialize the parent Graphics class.
        super();

        // Basic rounded rectangle
        this
            .roundRect(0, 0, Field.WIDTH, Field.HEIGHT, 30)
            .fill({ color: 0x4c8527 });
    }
}