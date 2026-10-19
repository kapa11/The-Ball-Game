export const GameState = {
    PLAYING: "PLAYING",
    GOAL_SCORED: "GOAL_SCORED",
    RESETTING: "RESETTING",
    FINISHED: "FINISHED"
} as const;

export type GameState = typeof GameState[keyof typeof GameState];