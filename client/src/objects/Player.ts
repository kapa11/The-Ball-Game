import { Graphics } from "pixi.js";
import { Input } from "../input/Input";
import { Vector2 } from "../math/Vector2"
export class Player extends Graphics {

    static readonly PLAYER_RADIUS = 12;

    static readonly FILL_COLOR = 0xa50044;
    static readonly OUTLINE_COLOR = 0x1a1a1a;
    static readonly OUTLINE_WIDTH = 2;

    static readonly SPEED = 300;

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

    update(dt: number, input: Input) {

        const direction = new Vector2();
        
        if (input.isDown("KeyW")) direction.y--;
        if (input.isDown("KeyS")) direction.y++;
        if (input.isDown("KeyA")) direction.x--;
        if (input.isDown("KeyD")) direction.x++;

        const displacement = direction.normalize().scale(Player.SPEED * dt);

        this.x += displacement.x;
        this.y += displacement.y;
    }
}