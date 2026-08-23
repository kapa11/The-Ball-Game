import { Container } from "pixi.js";
import { Field } from "./objects/Field";
import { Player } from "./objects/Player";
import { Input } from "./input/Input";
import { Vector2 } from "./math/Vector2";
import { Ball } from "./objects/Ball";

export class Game extends Container {

    readonly field: Field;
    readonly player: Player;
    readonly input: Input;
    readonly ball: Ball;
    static readonly PLAYER_BALL_RESTITUTION = 0.2;
    static readonly WALL_RESTITUTION = 0.6;

    constructor() {
        super();

        // Create game objects
        this.field = new Field();
        this.player = new Player();
        this.input = new Input();
        this.ball = new Ball();

        // Add them to the scene
        this.addChild(this.field);
        this.addChild(this.player);
        this.addChild(this.ball);

        // Initial positions
        this.player.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + 100, 
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);

        this.ball.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2,
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
    }

    private checkPlayerBallCollision() {
        const distanceVector = this.ball.physicsPosition.sub(this.player.physicsPosition);
        const distanceSquared = distanceVector.lengthSq();

        const radiusSum = Player.PLAYER_RADIUS + Ball.BALL_RADIUS;

        if (distanceSquared <= radiusSum * radiusSum) {
            //De-penetration
            const distance = Math.sqrt(distanceSquared);
            const overlap = radiusSum - distance;
            const normal = distanceVector.normalize(); //direction from player towards the ball
            const correction = normal.scale(overlap/2);

            this.ball.physicsPosition = this.ball.physicsPosition.add(correction);//separate ball from player
            this.player.physicsPosition = this.player.physicsPosition.sub(correction);

            //Collision Resolution
            const relativeVelocity = this.ball.velocity.sub(this.player.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            if(velocityAlongNormal<=0){
                //momentum conservation (1=ball, 2=player)
                //m1v1 = m1u1 + J (lighter object gains the instantaneous momentum post collision)
                //m2v2 = m2u2 - J (Heavier object loses the same instantaneous momentum post collision)
                const impulseMagnitude = (-(1 + Game.PLAYER_BALL_RESTITUTION)*velocityAlongNormal)/((1 / Ball.MASS)+(1 / Player.MASS));
                const impulse = normal.scale(impulseMagnitude);

                this.ball.velocity = this.ball.velocity.add(impulse.scale(1 / Ball.MASS));
                this.player.velocity = this.player.velocity.sub(impulse.scale(1 / Player.MASS));
            }
        }
    }

    private kickBall() {
        const kickDirection = this.ball.physicsPosition.sub(this.player.physicsPosition).normalize();
        const impulse = kickDirection.scale(Player.KICK_IMPULSE);

        this.ball.velocity =this.ball.velocity.add(impulse.scale(1 / Ball.MASS));
    }

    private checkKick() {
        if (!this.input.isPressed("Space")) {
            return;
        }

        const distanceVector = this.ball.physicsPosition.sub(this.player.physicsPosition);

        const kickRange = Player.PLAYER_RADIUS + Ball.BALL_RADIUS + Player.KICK_RANGE;

        if (distanceVector.lengthSq() <= kickRange * kickRange) {
            this.kickBall();
        }
    }

    private checkBallWallCollision() {

        const left = Field.WORLD_MARGIN_X;
        const right = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH;
        const top = Field.WORLD_MARGIN_Y;
        const bottom = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT;

        const r = Ball.BALL_RADIUS;
        const e = Game.WALL_RESTITUTION;

        // Top wall
        if (this.ball.physicsPosition.y - r < top) {
            this.ball.physicsPosition.y = top + r;

            if (this.ball.velocity.y < 0) {
                this.ball.velocity.y *= -e;
            }
        }

        // Bottom wall
        if (this.ball.physicsPosition.y + r > bottom) {
            this.ball.physicsPosition.y = bottom - r;

            if (this.ball.velocity.y > 0) {
                this.ball.velocity.y *= -e;
            }
        }

        const goalTop = top + (Field.PITCH_HEIGHT - Field.GOAL_WIDTH) / 2;
        const goalBottom = goalTop + Field.GOAL_WIDTH;
        const leftGoalBack = left - Field.GOAL_DEPTH;

        // Left upper wall
        if (
            this.ball.physicsPosition.x - r < left &&
            this.ball.physicsPosition.y < goalTop
        ) {
            this.ball.physicsPosition.x = left + r;

            if (this.ball.velocity.x < 0) {
                this.ball.velocity.x *= -e;
            }
        }

        // Left lower wall
        if (
            this.ball.physicsPosition.x - r < left &&
            this.ball.physicsPosition.y > goalBottom
        ) {
            this.ball.physicsPosition.x = left + r;

            if (this.ball.velocity.x < 0) {
                this.ball.velocity.x *= -e;
            }
        }

        // Left goal - top inside wall
        if (
            this.ball.physicsPosition.x < left &&
            this.ball.physicsPosition.y - r < goalTop
        ) {
            this.ball.physicsPosition.y = goalTop + r;

            if (this.ball.velocity.y < 0) {
                this.ball.velocity.y *= -e;
            }
        }

        // Left goal - bottom inside wall
        if (
            this.ball.physicsPosition.x < left &&
            this.ball.physicsPosition.y + r > goalBottom
        ) {
            this.ball.physicsPosition.y = goalBottom - r;

            if (this.ball.velocity.y > 0) {
                this.ball.velocity.y *= -e;
            }
        }


        // Left goal - back wall
        if (
            this.ball.physicsPosition.x - r < leftGoalBack &&
            this.ball.physicsPosition.y > goalTop &&
            this.ball.physicsPosition.y < goalBottom
        ) {
            this.ball.physicsPosition.x = leftGoalBack + r;

            if (this.ball.velocity.x < 0) {
                this.ball.velocity.x *= -e;
            }
        }

        const rightGoalBack = right + Field.GOAL_DEPTH;

        // Right upper wall
        if (
            this.ball.physicsPosition.x + r > right &&
            this.ball.physicsPosition.y < goalTop
        ) {
            this.ball.physicsPosition.x = right - r;

            if (this.ball.velocity.x > 0) {
                this.ball.velocity.x *= -e;
            }
        }

        // Right lower wall
        if (
            this.ball.physicsPosition.x + r > right &&
            this.ball.physicsPosition.y > goalBottom
        ) {
            this.ball.physicsPosition.x = right - r;

            if (this.ball.velocity.x > 0) {
                this.ball.velocity.x *= -e;
            }
        }

        // Right goal - top inside wall
        if (
            this.ball.physicsPosition.x > right &&
            this.ball.physicsPosition.y - r < goalTop
        ) {
            this.ball.physicsPosition.y = goalTop + r;

            if (this.ball.velocity.y < 0) {
                this.ball.velocity.y *= -e;
            }
        }

        // Right goal - bottom inside wall
        if (
            this.ball.physicsPosition.x > right &&
            this.ball.physicsPosition.y + r > goalBottom
        ) {
            this.ball.physicsPosition.y = goalBottom - r;

            if (this.ball.velocity.y > 0) {
                this.ball.velocity.y *= -e;
            }
        }

        // Right goal - back wall
        if (
            this.ball.physicsPosition.x + r > rightGoalBack &&
            this.ball.physicsPosition.y > goalTop &&
            this.ball.physicsPosition.y < goalBottom
        ) {
            this.ball.physicsPosition.x = rightGoalBack - r;

            if (this.ball.velocity.x > 0) {
                this.ball.velocity.x *= -e;
            }
        }
    }

    update(dt: number) {
        this.player.update(dt, this.input);
        this.ball.update(dt);

        this.checkPlayerBallCollision();
        this.checkBallWallCollision();

        this.checkKick();
        this.input.endFrame();
    }
}