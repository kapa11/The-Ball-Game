import type { GameState } from "./GameState.ts";
import type { Team } from "./PlayerData.ts";

export interface SimulationSnapshot {
    players: {
        id: string;
        team: Team;
        x: number;
        y: number;
        vx: number;
        vy: number;
    }[];

    ball: {
        x: number;
        y: number;
        vx: number;
        vy: number;
    };

    score: {
        left: number;
        right: number;
    };

    timer: number;
    phase: GameState;
}