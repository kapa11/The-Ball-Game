import { PhysicsBody } from "../physics/PhysicsBody"
import { Vector2 } from "../math/Vector2";

export class Ball extends PhysicsBody{

    static readonly BALL_RADIUS = 10;
    static readonly MASS = 1;

    readonly radius = Ball.BALL_RADIUS;
    readonly mass = Ball.MASS;
    constructor() {
        super();
    }
    //static readonly FRICTION = 0.4; if keeping exponential decel
    static readonly DECELERATION = 60;
    static readonly EPSILON = 0.5;

    

    update(dt: number) {
        //this.velocity = this.velocity.scale(1 - Ball.FRICTION * dt); exponential deceleration

        const speed = this.velocity.length();
        const newSpeed = Math.max(0,speed - Ball.DECELERATION * dt); //linear deceleration
        this.velocity = this.velocity.normalize().scale(newSpeed);

        /*if (this.velocity.lengthSq() < Ball.EPSILON * Ball.EPSILON) { //to tackle floating point residues
            this.velocity = new Vector2();
        }*/ //If keeping exponential decel

        this.physicsPosition = this.physicsPosition.add(this.velocity.scale(dt));

    }
}