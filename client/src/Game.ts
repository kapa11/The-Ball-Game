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
        }   
    }

    update(dt: number) {
        this.player.update(dt, this.input);
        this.ball.update(dt);

        this.checkPlayerBallCollision();
    }
}