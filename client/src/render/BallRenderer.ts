import { Graphics } from "pixi.js";
import { Ball } from "../../../shared/game/objects/Ball.ts";
import type { SimulationSnapshot } from "../../../shared/game/game/SimulationSnapshot.ts";

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