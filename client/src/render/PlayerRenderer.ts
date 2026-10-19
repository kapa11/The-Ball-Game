import { Graphics } from "pixi.js";
import { Player } from "../../../shared/game/objects/Player.ts";
import type { SimulationSnapshot } from "../../../shared/game/game/SimulationSnapshot.ts";

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

    sync(player: SimulationSnapshot["players"][number]) {
        this.position.set(player.x, player.y);
    }
}