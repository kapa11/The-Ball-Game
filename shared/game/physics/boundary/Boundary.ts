import { BoundaryShape } from "./BoundaryShape.ts";

export class Boundary {

    readonly shapes: BoundaryShape[] = [];

    addShape(shape: BoundaryShape): void {
        this.shapes.push(shape);
    }
}