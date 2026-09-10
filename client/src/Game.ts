import { Field } from "./objects/Field";

import { Player } from "./objects/Player";

import { Vector2 } from "./math/Vector2";

import { Ball } from "./objects/Ball";


import { CollisionSystem } from "./physics/CollisionSystem";
import { MatchState } from "./game/MatchState";
import { GoalDetector } from "./game/GoalDetector";
import { GameState } from "../src/game/GameState";
import type { PlayerInput } from "./input/PlayerInput";

export class Game {

    readonly field: Field;
    //readonly fieldRenderer: FieldRenderer;

    readonly player: Player;
    //readonly playerRenderer: PlayerRenderer;
    //readonly input: Input;
    readonly ball: Ball;
    //readonly ballRenderer: BallRenderer;
    readonly matchState: MatchState;

    static readonly PLAYER_BALL_RESTITUTION = 0.2;
    static readonly WALL_RESTITUTION = 0.6;

    static readonly MATCH_DURATION = 100; // seconds
    static readonly GOAL_PAUSE_DURATION = 4; // seconds

    constructor() {
        //super();

        // Create game objects
        this.field = new Field();
        //this.fieldRenderer = new FieldRenderer();
        this.player = new Player();
        //this.playerRenderer = new PlayerRenderer();
        //this.input = new Input();
        this.ball = new Ball();
        //this.ballRenderer = new BallRenderer();
        this.matchState = new MatchState();

        // Add them to the scene
        //this.addChild(this.fieldRenderer);
        //this.addChild(this.playerRenderer);
        //this.addChild(this.ballRenderer);

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
    
    update(dt: number, input: PlayerInput) {

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

        //this.playerRenderer.sync(this.player);
        //this.ballRenderer.sync(this.ball);
        //this.input.endFrame();
    }
} 