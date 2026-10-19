import { Vector2 } from "../../math/Vector2.ts";
import { BoundaryShape } from "./BoundaryShape.ts";

export class LineSegment extends BoundaryShape {

    start: Vector2;
    end: Vector2;

    constructor(start: Vector2, end: Vector2) {
        super();

        this.start = start;
        this.end = end;
    }
}