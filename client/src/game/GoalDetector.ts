import { Ball } from "../objects/Ball";
import { Field } from "../objects/Field";

export class GoalDetector {

    static checkGoal(ball: Ball, field: Field): "LEFT" | "RIGHT" | null {

        const top = Field.WORLD_MARGIN_Y;
        const left = Field.WORLD_MARGIN_X;
        const right = left + Field.PITCH_WIDTH;

        const goalTop = top + (Field.PITCH_HEIGHT - Field.GOAL_WIDTH) / 2;

        const goalBottom = goalTop + Field.GOAL_WIDTH;

        const ballX = ball.physicsPosition.x;
        const ballY = ball.physicsPosition.y;
        const r = Ball.BALL_RADIUS;

        // Left goal
        if (
            ballX + r < left &&
            ballY >= goalTop &&
            ballY <= goalBottom
        ) {
            return "LEFT"; //Goal has been scored in the left goal (goal for right team)
        }

        // Right goal
        if (
            ballX - r > right &&
            ballY >= goalTop &&
            ballY <= goalBottom
        ) {
            return "RIGHT"; //Goal has been scored in the right goal (goal for left team)
        }

        return null;
    }
}