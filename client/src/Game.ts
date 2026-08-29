import { Container } from "pixi.js";
import { Field } from "./objects/Field";
import { Player } from "./objects/Player";
import { Input } from "./input/Input";
import { Vector2 } from "./math/Vector2";
import { Ball } from "./objects/Ball";
import { CollisionSystem } from "./physics/CollisionSystem";
import { MatchState } from "./game/MatchState";
import { GoalDetector } from "./game/GoalDetector";
import { GameState } from "../src/game/GameState";

export class Game extends Container {

    readonly field: Field;
    readonly player: Player;
    readonly input: Input;
    readonly ball: Ball;
    readonly matchState: MatchState;

    static readonly PLAYER_BALL_RESTITUTION = 0.2;
    static readonly WALL_RESTITUTION = 0.6;

    static readonly MATCH_DURATION = 10; // seconds
    static readonly GOAL_PAUSE_DURATION = 4; // seconds

    constructor() {
        super();

        // Create game objects
        this.field = new Field();
        this.player = new Player();
        this.input = new Input();
        this.ball = new Ball();
        this.matchState = new MatchState();

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

        this.ball.velocity = this.ball.velocity.add(impulse.scale(1 / Ball.MASS));
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

    private handleGoal(goal: "LEFT" | "RIGHT") {

        if (goal === "LEFT") {
            this.matchState.scoreRight++;
        }
        else {
            this.matchState.scoreLeft++;
        }

        this.ball.velocity = new Vector2();

        this.player.velocity = new Vector2();
        this.player.acceleration = new Vector2();

        this.matchState.state = GameState.GOAL_SCORED;
    }

    private resetAfterGoal() {

        // Reset ball
        this.ball.physicsPosition = new Vector2(Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2, Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
        this.ball.velocity = new Vector2();

        // Reset player
        this.player.physicsPosition = new Vector2(Field.WORLD_MARGIN_X + 100, Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
        this.player.velocity = new Vector2();
        this.player.acceleration = new Vector2();

        // Reset state
        this.matchState.goalPauseTime = 0;
        this.matchState.state = GameState.PLAYING;
    }
    
    update(dt: number) {

        if (this.matchState.state === GameState.PLAYING) {
            this.matchState.matchTime += dt;

            this.player.update(dt, this.input);
            this.ball.update(dt);

            this.checkPlayerBallCollision();
            this.checkKick();

            CollisionSystem.resolveBallBoundaryCollision(this.ball, this.field.boundary, Game.WALL_RESTITUTION);

            const goal = GoalDetector.checkGoal(this.ball, this.field);

            if (goal !== null) {
                this.handleGoal(goal);
            }

            if (this.matchState.matchTime >= Game.MATCH_DURATION) {
                this.matchState.state = GameState.FINISHED;
            }
        }

        else if (this.matchState.state === GameState.GOAL_SCORED) {
             this.matchState.goalPauseTime += dt;

            if (this.matchState.goalPauseTime >= Game.GOAL_PAUSE_DURATION) {
                this.matchState.state = GameState.RESETTING;
            }
        }

        else if (this.matchState.state === GameState.RESETTING) {
            this.resetAfterGoal();
        }

        this.input.endFrame();
    }
}