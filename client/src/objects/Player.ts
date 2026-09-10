import { Vector2 } from "../math/Vector2"
import { Field } from "./Field";
import type { PlayerInput } from "../input/PlayerInput"
import { PhysicsBody } from "../physics/PhysicsBody";

export class Player extends PhysicsBody {

    static readonly ACCELERATION = 900;
    static readonly MAX_SPEED = 200;
    static readonly DECELERATION = 1200;
    static readonly PLAYER_RADIUS = 15;
    static readonly MASS = 80;

    readonly radius = Player.PLAYER_RADIUS;
    readonly mass = Player.MASS;

    static readonly KICK_IMPULSE = 400;
    static readonly KICK_RANGE = 5;

    acceleration = new Vector2();

    constructor() {
        super();
    }
    
    private constrainToField() {

        const left = Field.WORLD_MARGIN_X;
        const right = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH;

        const top = Field.WORLD_MARGIN_Y;
        const bottom = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT;

        const r = this.radius;

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
    }

    update(dt: number, input: PlayerInput) {

        const direction = new Vector2();
        
        if (input.up) direction.y--;
        if (input.down) direction.y++;
        if (input.left) direction.x--;
        if (input.right) direction.x++;

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
        this.constrainToField();
    }
}