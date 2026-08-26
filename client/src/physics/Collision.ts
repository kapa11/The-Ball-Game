import { Vector2 } from "../math/Vector2";
import { BoundaryShape } from "./boundary/BoundaryShape";

export class Collision {

    shape: BoundaryShape;
    closestPoint: Vector2;
    normal: Vector2;
    penetration: number;

    constructor(shape: BoundaryShape, closestPoint: Vector2, normal: Vector2, penetration: number) {
        this.shape = shape;
        this.closestPoint = closestPoint;
        this.normal = normal;
        this.penetration = penetration;
    }
}