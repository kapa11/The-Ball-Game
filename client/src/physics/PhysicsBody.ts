import { Vector2 } from "../math/Vector2";

export abstract class PhysicsBody {
    physicsPosition: Vector2;
    velocity: Vector2;

    abstract readonly radius: number;
    abstract readonly mass: number;

    constructor() {
        this.physicsPosition = new Vector2();
        this.velocity = new Vector2();
    }
}