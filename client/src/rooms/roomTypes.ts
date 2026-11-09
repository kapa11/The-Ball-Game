export type RoomTeam = "RED" | "BLUE";

export type MaxPlayersOption = 2 | 4 | 6;

export interface RoomPlayer {
    id: string;
    name: string;
    username?: string;
    team: RoomTeam;
    isReady: boolean;
    isHost: boolean;
}

export interface RoomSessionState {
    code: string;
    name: string;
    hasPassword: boolean;
    maxPlayers: MaxPlayersOption;
    hostId: string;
    players: RoomPlayer[];
}

export interface CreateRoomInput {
    roomName?: string;
    password: string;
    maxPlayers: MaxPlayersOption;
}

export interface JoinRoomInput {
    roomCode: string;
    password: string;
}
