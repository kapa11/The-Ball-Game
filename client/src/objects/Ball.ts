import { Graphics } from "pixi.js";
import { Vector2 } from "../math/Vector2";

export class Ball extends Graphics {

    static readonly BALL_RADIUS = 10;
    static readonly FILL_COLOR = 0xffffff;
    static readonly OUTLINE_COLOR = 0x1a1a1a;
    static readonly OUTLINE_WIDTH = 2;

    //static readonly FRICTION = 0.4; if keeping exponential decel
    static readonly DECELERATION = 60;
    static readonly EPSILON = 0.5;

    static readonly MASS = 1;

    physicsPosition = new Vector2();
    velocity = new Vector2();

    constructor() {
        super();
        
        this
            .circle(0, 0, Ball.BALL_RADIUS)
            .fill({color: Ball.FILL_COLOR})
            .stroke({
                color: Ball.OUTLINE_COLOR,
                width: Ball.OUTLINE_WIDTH
            });
    }

    update(dt: number) {
        //this.velocity = this.velocity.scale(1 - Ball.FRICTION * dt); exponential deceleration

        const speed = this.velocity.length();
        const newSpeed = Math.max(0,speed - Ball.DECELERATION * dt); //linear deceleration
        this.velocity = this.velocity.normalize().scale(newSpeed);

        /*if (this.velocity.lengthSq() < Ball.EPSILON * Ball.EPSILON) { //to tackle floating point residues
            this.velocity = new Vector2();
        }*/ //If keeping exponential decel

        this.physicsPosition = this.physicsPosition.add(this.velocity.scale(dt));

        this.x = this.physicsPosition.x;
        this.y = this.physicsPosition.y;
    }
}