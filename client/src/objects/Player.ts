import { Graphics } from "pixi.js";

export class Player extends Graphics {

    static readonly PLAYER_RADIUS = 12;

    static readonly FILL_COLOR = 0xa50044;
    static readonly OUTLINE_COLOR = 0x1a1a1a;
    static readonly OUTLINE_WIDTH = 2;

    vx = 0;
    vy = 0;

    constructor() {
        super();

        this
            .circle(0, 0, Player.PLAYER_RADIUS)
            .fill({ color: Player.FILL_COLOR })
            .stroke({
                color: Player.OUTLINE_COLOR,
                width: Player.OUTLINE_WIDTH
            });
    }
}