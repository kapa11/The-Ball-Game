import type { AuthenticatedUser } from "../auth/AuthUI";
import type {
    CreateRoomInput,
    JoinRoomInput,
    RoomPlayer,
    RoomSessionState,
    RoomTeam,
} from "./roomTypes";

/**
 * Temporary client-side room session adapter for V1 UI navigation.
 *
 * NOTE: Backend room management is not implemented yet. This isolated module
 * holds ephemeral in-memory room state so that the Dashboard -> Create/Join ->
 * Room Lobby -> Game flow can be navigated and tested cleanly, and can be
 * swapped out for Socket.io room events in the next milestone.
 */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6): string {
    let code = "";
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * CODE_CHARS.length);
        code += CODE_CHARS[index];
    }
    return code;
}

export function normalizeRoomCode(raw: string): string {
    return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export class ClientRoomSession {
    private state: RoomSessionState;
    private readonly currentUserId: string;

    private constructor(state: RoomSessionState, currentUserId: string) {
        this.state = state;
        this.currentUserId = currentUserId;
    }

    public static fromCreate(
        user: AuthenticatedUser,
        input: CreateRoomInput
    ): ClientRoomSession {
        const code = generateRoomCode(6);
        const trimmedName = (input.roomName ?? "").trim();
        const fallbackName = `${user.username || user.name || "Player"}'s Pitch`;

        const hostPlayer: RoomPlayer = {
            id: user.id,
            name: user.name || user.username || user.email,
            username: user.username,
            team: "RED",
            isReady: true,
            isHost: true,
        };

        return new ClientRoomSession(
            {
                code,
                name: trimmedName || fallbackName,
                hasPassword: input.password.trim().length > 0,
                maxPlayers: input.maxPlayers,
                hostId: user.id,
                players: [hostPlayer],
            },
            user.id
        );
    }

    public static fromJoin(
        user: AuthenticatedUser,
        input: JoinRoomInput
    ): ClientRoomSession {
        const code = normalizeRoomCode(input.roomCode);

        const hostPlaceholder: RoomPlayer = {
            id: `host-${code.toLowerCase()}`,
            name: "Room Host",
            username: "captain",
            team: "RED",
            isReady: true,
            isHost: true,
        };

        const joiningPlayer: RoomPlayer = {
            id: user.id,
            name: user.name || user.username || user.email,
            username: user.username,
            team: "BLUE",
            isReady: false,
            isHost: false,
        };

        return new ClientRoomSession(
            {
                code,
                name: `Private Room #${code}`,
                hasPassword: input.password.trim().length > 0,
                maxPlayers: 4,
                hostId: hostPlaceholder.id,
                players: [hostPlaceholder, joiningPlayer],
            },
            user.id
        );
    }

    public getState(): RoomSessionState {
        return {
            ...this.state,
            players: this.state.players.map((p) => ({ ...p })),
        };
    }

    public getCurrentUserId(): string {
        return this.currentUserId;
    }

    public isCurrentUserHost(): boolean {
        return this.state.hostId === this.currentUserId;
    }

    public switchTeam(team: RoomTeam): RoomSessionState {
        const maxPerTeam = this.state.maxPlayers / 2;
        const teamCount = this.state.players.filter(
            (p) => p.team === team && p.id !== this.currentUserId
        ).length;

        if (teamCount >= maxPerTeam) {
            return this.getState();
        }

        this.state.players = this.state.players.map((player) =>
            player.id === this.currentUserId ? { ...player, team } : player
        );

        return this.getState();
    }

    public toggleReady(): RoomSessionState {
        this.state.players = this.state.players.map((player) =>
            player.id === this.currentUserId
                ? { ...player, isReady: !player.isReady }
                : player
        );

        return this.getState();
    }

    public canStartMatch(): { allowed: boolean; reason?: string } {
        if (!this.isCurrentUserHost()) {
            return {
                allowed: false,
                reason: "Waiting for the room host to start the match.",
            };
        }

        if (this.state.players.length === 0) {
            return {
                allowed: false,
                reason: "At least one player must be in the room.",
            };
        }

        const allReady = this.state.players.every((p) => p.isReady);
        if (!allReady) {
            return {
                allowed: false,
                reason: "All players in the lobby must mark themselves Ready before kickoff.",
            };
        }

        return { allowed: true };
    }
}
