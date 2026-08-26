import { Vector2 } from "../../math/Vector2";
import { BoundaryShape } from "./BoundaryShape";

export class LineSegment extends BoundaryShape {

    start: Vector2;
    end: Vector2;

    constructor(start: Vector2, end: Vector2) {
        super();

        this.start = start;
        this.end = end;
    }
}