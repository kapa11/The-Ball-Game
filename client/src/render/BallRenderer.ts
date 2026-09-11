import { Graphics } from "pixi.js";
import { Ball } from "../objects/Ball";
import type { SimulationSnapshot } from "../game/SimulationSnapshot";

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

    sync(ball: SimulationSnapshot["ball"]) {
        this.position.set(ball.x, ball.y);
    }
}