export type PlayerInput = {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    kick: boolean;
};

export type ClientMessage = {
    type: "input";
} & PlayerInput;

export type NetworkPlayer = {
    id: string;
    team: "RED" | "BLUE";
    x: number;
    y: number;
    vx: number;
    vy: number;
};

export type MatchPhase =
    | "PLAYING"
    | "GOAL_SCORED"
    | "RESETTING"
    | "FINISHED";

export type GameSnapshot = {
    players: NetworkPlayer[];

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
    phase: MatchPhase;
};

export type ServerMessage =
    | {
          type: "welcome";
          playerId: string;
      }
    | {
          type: "state";
          snapshot: GameSnapshot;
      };