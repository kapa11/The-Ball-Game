import { Graphics } from "pixi.js";
import { Player } from "../objects/Player";
import type { SimulationSnapshot } from "../game/SimulationSnapshot";

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

    sync(player: SimulationSnapshot["player"]) {
        this.position.set(player.x, player.y);
    }
}