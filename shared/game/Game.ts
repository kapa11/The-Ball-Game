import { Field } from "./objects/Field.ts";
import { Player } from "./objects/Player.ts";
import { Vector2 } from "./math/Vector2.ts";
import { Ball } from "./objects/Ball.ts";
import type { SimulationSnapshot } from "./game/SimulationSnapshot.ts";
import { CollisionSystem } from "./physics/CollisionSystem.ts";
import { MatchState } from "./game/MatchState.ts";
import { GoalDetector } from "./game/GoalDetector.ts";
import { GameState } from "./game/GameState.ts";
import type { PlayerInput } from "../protocol.ts";
import type { PlayerData, PlayerInputs, Team } from "./game/PlayerData.ts";

export class Game {

    readonly field: Field;
    readonly players = new Map<string, PlayerData>();
    readonly ball: Ball;
    readonly matchState: MatchState;

    static readonly PLAYER_BALL_RESTITUTION = 0.2;
    static readonly WALL_RESTITUTION = 0.6;

    static readonly MATCH_DURATION = 2000; // seconds
    static readonly GOAL_PAUSE_DURATION = 4; // seconds

    constructor() {
        // Create game objects
        this.field = new Field();
        //this.player = new Player();
        this.ball = new Ball();
        this.matchState = new MatchState();

        // Initial positions
        /*this.player.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + 100, 
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);*/

        this.ball.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2,
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
    }

    private getNeutralInput(): PlayerInput {
        return {
            up: false,
            down: false,
            left: false,
            right: false,
            kick: false
        };
    }

    addPlayer(id: string, team: Team): void {
        const player = new Player();

        player.physicsPosition = new Vector2(
            Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2,
            Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2
        );

        this.players.set(id, {
            id,
            team,
            body: player
        });
    }

    private checkKick(player: Player, input: PlayerInput) {
        if (!input.kick) {
            return;
        }

        const distanceVector = this.ball.physicsPosition.sub(player.physicsPosition);

        const kickRange = player.radius + this.ball.radius + Player.KICK_RANGE;

        if (distanceVector.lengthSq() <= kickRange * kickRange) {
            CollisionSystem.applyKick(player, this.ball, Player.KICK_IMPULSE);
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

        for (const playerData of this.players.values()) {
            playerData.body.velocity = new Vector2();
            playerData.body.acceleration = new Vector2();
        }

        this.matchState.state = GameState.GOAL_SCORED;
    }

    private resetAfterGoal() {

        // Reset ball
        this.ball.physicsPosition = new Vector2(Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2, Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2);
        this.ball.velocity = new Vector2();

        // Reset players
        for (const playerData of this.players.values()) {
            const player = playerData.body;

            const spawnX =
                playerData.team === "RED"
                    ? Field.WORLD_MARGIN_X + 100
                    : Field.WORLD_MARGIN_X + Field.PITCH_WIDTH - 100;

            const spawnY =
                Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2;

            player.physicsPosition = new Vector2(spawnX, spawnY);
            player.velocity = new Vector2();
            player.acceleration = new Vector2();
        }

        // Reset state
        this.matchState.goalPauseTime = 0;
        this.matchState.state = GameState.PLAYING;
    }
    
    private getSnapshot(): SimulationSnapshot {
        return {
            players: Array.from(this.players.values(), (playerData) => ({
                id: playerData.id,
                team: playerData.team,
                x: playerData.body.physicsPosition.x,
                y: playerData.body.physicsPosition.y,
                vx: playerData.body.velocity.x,
                vy: playerData.body.velocity.y
            })),

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

    update(dt: number, inputs: PlayerInputs): SimulationSnapshot {

        if (this.matchState.state === GameState.PLAYING) {
            this.matchState.matchTime += dt;

            for (const [id, playerData] of this.players) {
                const input = inputs.get(id) ?? this.getNeutralInput();
                playerData.body.update(dt, input);
            }

            this.ball.update(dt);

            // Resolve collisions between players
            const playerList = Array.from(this.players.values());

            for (let i = 0; i < playerList.length; i++) {
                for (let j = i + 1; j < playerList.length; j++) {
                    CollisionSystem.resolveBodyCollision(
                        playerList[i].body,
                        playerList[j].body,
                        0.2
                    );
                }
            }

            for (const [id, playerData] of this.players) {
                const input = inputs.get(id) ?? this.getNeutralInput();

                CollisionSystem.resolveBodyCollision(
                    playerData.body,
                    this.ball,
                    Game.PLAYER_BALL_RESTITUTION
                );

                this.checkKick(playerData.body, input);
            }

            CollisionSystem.resolveBallBoundaryCollision(this.ball, this.field.boundary, Game.WALL_RESTITUTION);

            const goal = GoalDetector.checkGoal(this.ball);

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