export class Vector2 {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector2): Vector2 {
        return new Vector2(
            this.x + v.x,
            this.y + v.y
        );
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(
            this.x - v.x,
            this.y - v.y
        );
    }
    
    scale(s: number): Vector2 {
        return new Vector2(
            this.x * s,
            this.y * s
        );
    }

    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.lengthSq());
    }

    normalize(): Vector2 {

        const len = this.length();

        if (len === 0)
            return new Vector2();

        return new Vector2(
            this.x / len,
            this.y / len
        );
    }

}