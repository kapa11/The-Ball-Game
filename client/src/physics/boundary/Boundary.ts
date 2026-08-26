import { BoundaryShape } from "./BoundaryShape";

export class Boundary {

    readonly shapes: BoundaryShape[] = [];

    addShape(shape: BoundaryShape): void {
        this.shapes.push(shape);
    }
}