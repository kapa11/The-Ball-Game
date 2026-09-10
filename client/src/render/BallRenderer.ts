import { Graphics } from "pixi.js";
import { Ball } from "../objects/Ball";

export class BallRenderer extends Graphics {

    constructor() {
        super();

        this
            .circle(0, 0, Ball.BALL_RADIUS)
            .fill({ color: 0xffffff })
            .stroke({
                color: 0x1a1a1a,
                width: 2
            });
    }

    sync(ball: Ball) {
        this.position.set(
            ball.physicsPosition.x,
            ball.physicsPosition.y
        );
    }
}