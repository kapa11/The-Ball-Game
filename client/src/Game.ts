import { Field } from "./objects/Field";
import { Player } from "./objects/Player";
import { Vector2 } from "./math/Vector2";
import { Ball } from "./objects/Ball";
import type { SimulationSnapshot } from "./game/SimulationSnapshot";
import { CollisionSystem } from "./physics/CollisionSystem";
import { MatchState } from "./game/MatchState";
import { GoalDetector } from "./game/GoalDetector";
import { GameState } from "../src/game/GameState";
import type { PlayerInput } from "./input/PlayerInput";

export class Game {

    readonly field: Field;
    readonly player: Player;
    readonly ball: Ball;
    readonly matchState: MatchState;

    static readonly PLAYER_BALL_RESTITUTION = 0.2;
    static readonly WALL_RESTITUTION = 0.6;

    static readonly MATCH_DURATION = 100; // seconds
    static readonly GOAL_PAUSE_DURATION = 4; // seconds

    constructor() {
        // Create game objects
        this.field = new Field();
        this.player = new Player();
        this.ball = new Ball();
        this.matchState = new MatchState();

        // Initial positions
        this.player.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + 100, 
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);

        this.ball.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2,
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
    }

    private checkKick(input : PlayerInput) {
        if (!input.kick) {
            return;
        }

        const distanceVector = this.ball.physicsPosition.sub(this.player.physicsPosition);

        const kickRange = this.player.radius + this.ball.radius + Player.KICK_RANGE;

        if (distanceVector.lengthSq() <= kickRange * kickRange) {
            CollisionSystem.applyKick(this.player, this.ball, Player.KICK_IMPULSE);
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
    
    private getSnapshot(): SimulationSnapshot {
        return {
            player: {
                x: this.player.physicsPosition.x,
                y: this.player.physicsPosition.y,
                vx: this.player.velocity.x,
                vy: this.player.velocity.y,
            },

            ball: {
                x: this.ball.physicsPosition.x,
                y: this.ball.physicsPosition.y,
                vx: this.ball.velocity.x,
                vy: this.ball.velocity.y,
            },

            score: {
                left: this.matchState.scoreLeft,
                right: this.matchState.scoreRight,
            },

            timer: this.matchState.matchTime,
            phase: this.matchState.state,
        };
    }

    update(dt: number, input: PlayerInput): SimulationSnapshot {

        if (this.matchState.state === GameState.PLAYING) {
            this.matchState.matchTime += dt;

            this.player.update(dt, input);

            this.ball.update(dt);

            
            CollisionSystem.resolveBodyCollision(this.player, this.ball, Game.PLAYER_BALL_RESTITUTION);
            this.checkKick(input);

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

        return this.getSnapshot();
    }
} 