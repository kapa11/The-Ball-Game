import type { GameState } from "./GameState";

export interface SimulationSnapshot {
    player: {
        x: number;
        y: number;
        vx: number;
        vy: number;
    };

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