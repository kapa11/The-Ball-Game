import { Graphics } from "pixi.js";
import { Input } from "../input/Input";
import { Vector2 } from "../math/Vector2"
import { Field } from "./Field";

export class Player extends Graphics {

    static readonly PLAYER_RADIUS = 15;

    static readonly FILL_COLOR = 0xa50044;
    static readonly OUTLINE_COLOR = 0x1a1a1a;
    static readonly OUTLINE_WIDTH = 2;

    static readonly ACCELERATION = 900;
    static readonly MAX_SPEED = 200;
    static readonly DECELERATION = 1200;
    static readonly MASS = 80;
    
    physicsPosition = new Vector2();
    velocity = new Vector2();
    acceleration = new Vector2();

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

    private constrainToField() {

        const left = Field.WORLD_MARGIN_X;
        const right = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH;

        const top = Field.WORLD_MARGIN_Y;
        const bottom = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT;

        const r = Player.PLAYER_RADIUS;

        if (this.physicsPosition.x - r < left) {
            this.physicsPosition.x = left + r;
        }

        if (this.physicsPosition.x + r > right) {
            this.physicsPosition.x = right - r;
        }

        if (this.physicsPosition.y - r < top) {
            this.physicsPosition.y = top + r;
        }

        if (this.physicsPosition.y + r > bottom) {
            this.physicsPosition.y = bottom - r;
        }

        this.x = this.physicsPosition.x;
        this.y = this.physicsPosition.y;
    }

    update(dt: number, input: Input) {

        const direction = new Vector2();
        
        if (input.isDown("KeyW")) direction.y--;
        if (input.isDown("KeyS")) direction.y++;
        if (input.isDown("KeyA")) direction.x--;
        if (input.isDown("KeyD")) direction.x++;

        if(direction.lengthSq()==0){
            const speed = this.velocity.length();
            const newSpeed = Math.max(0, speed - Player.DECELERATION * dt);
            this.velocity = this.velocity.normalize().scale(newSpeed);
        }
        else{
            this.acceleration = direction.normalize().scale(Player.ACCELERATION);
            this.velocity = this.velocity.add(this.acceleration.scale(dt));
        }

        const speed = this.velocity.length();
        if (speed > Player.MAX_SPEED) {
            this.velocity = this.velocity.normalize().scale(Player.MAX_SPEED);
        }

        this.physicsPosition = this.physicsPosition.add(this.velocity.scale(dt));
        this.x = this.physicsPosition.x;
        this.y = this.physicsPosition.y;
        this.constrainToField();
    }
}