import type { Player } from "../objects/Player";

export type Team = "RED" | "BLUE";

import type { PlayerInput } from "../input/PlayerInput";

export type PlayerInputs = Map<string, PlayerInput>;

export interface PlayerData {
    id: string;
    team: Team;
    body: Player;
}