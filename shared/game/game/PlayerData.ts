import type { Player } from "../objects/Player.ts";

export type Team = "RED" | "BLUE";

import type { PlayerInput } from "../../protocol.ts";

export type PlayerInputs = Map<string, PlayerInput>;

export interface PlayerData {
    id: string;
    team: Team;
    body: Player;
}