import { Graphics } from "pixi.js";
import { Player } from "../objects/Player";

export class PlayerRenderer extends Graphics {

    constructor() {
        super();

        this
            .circle(0, 0, Player.PLAYER_RADIUS)
            .fill({ color: 0xa50044 })
            .stroke({
                color: 0x1a1a1a,
                width: 3
            });
    }

    sync(player: Player) {
        this.position.set(
            player.physicsPosition.x,
            player.physicsPosition.y
        );
    }
}