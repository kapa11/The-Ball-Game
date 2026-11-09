import { auth } from "../auth/auth";
import type { AuthenticatedUser } from "../auth/AuthUI";
import type { ClientRoomSession } from "../rooms/mockRoomSession";
import type { RoomPlayer, RoomSessionState, RoomTeam } from "../rooms/roomTypes";

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "TB";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export class RoomLobbyUI {
    private readonly container: HTMLElement;
    private rootEl: HTMLElement | null = null;
    private readonly user: AuthenticatedUser;
    private readonly session: ClientRoomSession;
    private readonly onStartMatch: (state: RoomSessionState) => void;
    private readonly onLeaveRoom: () => void;
    private readonly onSignOut: () => void;
    private copyFeedbackTimeout: number | null = null;

    constructor(
        container: HTMLElement,
        user: AuthenticatedUser,
        session: ClientRoomSession,
        callbacks: {
            onStartMatch: (state: RoomSessionState) => void;
            onLeaveRoom: () => void;
            onSignOut: () => void;
        }
    ) {
        this.container = container;
        this.user = user;
        this.session = session;
        this.onStartMatch = callbacks.onStartMatch;
        this.onLeaveRoom = callbacks.onLeaveRoom;
        this.onSignOut = callbacks.onSignOut;
    }

    public mount(): void {
        this.render();
    }

    public destroy(): void {
        if (this.copyFeedbackTimeout !== null) {
            window.clearTimeout(this.copyFeedbackTimeout);
            this.copyFeedbackTimeout = null;
        }
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }

    private render(): void {
        if (this.rootEl) {
            this.rootEl.remove();
        }

        const state = this.session.getState();
        const currentUserId = this.session.getCurrentUserId();
        const isHost = this.session.isCurrentUserHost();
        const startCheck = this.session.canStartMatch();

        const currentPlayer = state.players.find((p) => p.id === currentUserId);
        const redPlayers = state.players.filter((p) => p.team === "RED");
        const bluePlayers = state.players.filter((p) => p.team === "BLUE");
        const maxPerTeam = state.maxPlayers / 2;
        const readyCount = state.players.filter((p) => p.isReady).length;

        const displayName =
            this.user.name || this.user.username || this.user.email.split("@")[0];
        const handleText = this.user.username
            ? `@${this.user.username}`
            : this.user.email;

        const screen = document.createElement("div");
        screen.className = "tbg-shell-screen";

        screen.innerHTML = `
            <div class="tbg-pitch-backdrop" aria-hidden="true">
                <div class="tbg-pitch-glow-orb"></div>
                <svg class="tbg-pitch-svg" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
                    <rect x="60" y="40" width="1080" height="640" rx="6" />
                    <line x1="600" y1="40" x2="600" y2="680" />
                    <circle cx="600" cy="360" r="92" />
                    <circle cx="600" cy="360" r="4" fill="rgba(34, 197, 94, 0.25)" />
                    <rect x="60" y="180" width="170" height="360" />
                    <rect x="60" y="265" width="64" height="190" />
                    <path d="M 230 290 A 85 85 0 0 1 230 430" />
                    <rect x="970" y="180" width="170" height="360" />
                    <rect x="1076" y="265" width="64" height="190" />
                    <path d="M 970 290 A 85 85 0 0 0 970 430" />
                </svg>
            </div>

            <div class="tbg-shell-layout">
                <!-- Top Navigation Bar -->
                <header class="tbg-topbar">
                    <div class="tbg-topbar-brand">
                        <div class="tbg-logo tbg-logo--sm">
                            TB<span class="tbg-logo-accent">G</span>
                        </div>
                        <span class="tbg-topbar-divider" aria-hidden="true"></span>
                        <span class="tbg-topbar-tag">Match Lobby</span>
                    </div>

                    <div class="tbg-topbar-account">
                        <div class="tbg-account-pill" title="${escapeHtml(this.user.email)}">
                            <span class="tbg-account-avatar" aria-hidden="true">${escapeHtml(getInitials(displayName))}</span>
                            <div class="tbg-account-meta">
                                <span class="tbg-account-name">${escapeHtml(displayName)}</span>
                                <span class="tbg-account-handle">${escapeHtml(handleText)}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="tbg-btn-outline tbg-btn-outline--danger"
                            id="tbg-lobby-signout"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <main class="tbg-lobby-main">
                    <!-- Room Header Banner -->
                    <section class="tbg-lobby-banner">
                        <div class="tbg-lobby-banner-info">
                            <div class="tbg-lobby-badges">
                                <span class="tbg-badge tbg-badge--private">
                                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                                    </svg>
                                    Private Room
                                </span>
                                <span class="tbg-badge tbg-badge--capacity">
                                    ${state.players.length} / ${state.maxPlayers} Players (${maxPerTeam}v${maxPerTeam})
                                </span>
                                <span class="tbg-badge tbg-badge--ready">
                                    ${readyCount} / ${state.players.length} Ready
                                </span>
                            </div>
                            <h1 class="tbg-lobby-title">${escapeHtml(state.name)}</h1>
                        </div>

                        <div class="tbg-room-code-box">
                            <div class="tbg-room-code-meta">
                                <span class="tbg-room-code-label">Room Code</span>
                                <strong class="tbg-room-code-value" id="tbg-room-code-value">${escapeHtml(state.code)}</strong>
                            </div>
                            <button
                                type="button"
                                class="tbg-copy-code-btn"
                                id="tbg-copy-code-btn"
                                aria-label="Copy room code"
                            >
                                <svg class="tbg-copy-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                                </svg>
                                <span id="tbg-copy-code-label">Copy Code</span>
                            </button>
                        </div>
                    </section>

                    <!-- Teams Grid (RED vs BLUE) -->
                    <section class="tbg-teams-grid">
                        ${this.renderTeamColumn("RED", "Red Squad", redPlayers, maxPerTeam, currentUserId)}
                        ${this.renderTeamColumn("BLUE", "Blue Squad", bluePlayers, maxPerTeam, currentUserId)}
                    </section>

                    <!-- Lobby Controls Footer -->
                    <footer class="tbg-lobby-footer">
                        <div class="tbg-lobby-footer-left">
                            <button
                                type="button"
                                class="tbg-btn-outline tbg-btn-outline--danger"
                                id="tbg-leave-room-btn"
                            >
                                Leave Room
                            </button>
                            <span class="tbg-lobby-status-hint">
                                ${escapeHtml(
                                    startCheck.allowed
                                        ? "All players are ready! Host can start the match."
                                        : startCheck.reason ?? ""
                                )}
                            </span>
                        </div>

                        <div class="tbg-lobby-footer-actions">
                            <button
                                type="button"
                                class="tbg-ready-toggle-btn ${
                                    currentPlayer?.isReady
                                        ? "tbg-ready-toggle-btn--active"
                                        : ""
                                }"
                                id="tbg-toggle-ready-btn"
                            >
                                <span class="tbg-ready-dot"></span>
                                <span>${
                                    currentPlayer?.isReady ? "Ready" : "Mark Ready"
                                }</span>
                            </button>

                            ${
                                isHost
                                    ? `
                                <button
                                    type="button"
                                    class="tbg-submit-btn tbg-start-match-btn"
                                    id="tbg-start-match-btn"
                                    ${startCheck.allowed ? "" : "disabled"}
                                >
                                    <span>Start Match</span>
                                </button>
                            `
                                    : `
                                <div class="tbg-host-wait-pill">
                                    <span class="tbg-btn-spinner tbg-btn-spinner--green" aria-hidden="true"></span>
                                    <span>Waiting for Host</span>
                                </div>
                            `
                            }
                        </div>
                    </footer>
                </main>
            </div>
        `;

        this.container.appendChild(screen);
        this.rootEl = screen;

        this.bindEvents(screen, state);
    }

    private renderTeamColumn(
        team: RoomTeam,
        title: string,
        players: RoomPlayer[],
        maxPerTeam: number,
        currentUserId: string
    ): string {
        const isCurrentTeam = players.some((p) => p.id === currentUserId);
        const isFull = players.length >= maxPerTeam;
        const emptySlotsCount = Math.max(0, maxPerTeam - players.length);

        const playerRows = players
            .map((player) => {
                const isMe = player.id === currentUserId;
                const handle = player.username ? `@${player.username}` : "";
                return `
                    <li class="tbg-player-slot tbg-player-slot--occupied ${
                        isMe ? "tbg-player-slot--me" : ""
                    }">
                        <div class="tbg-player-identity">
                            <span class="tbg-player-team-dot tbg-player-team-dot--${team.toLowerCase()}"></span>
                            <div class="tbg-player-names">
                                <div class="tbg-player-name-row">
                                    <span class="tbg-player-name">${escapeHtml(player.name)}</span>
                                    ${
                                        isMe
                                            ? '<span class="tbg-role-tag tbg-role-tag--you">You</span>'
                                            : ""
                                    }
                                    ${
                                        player.isHost
                                            ? '<span class="tbg-role-tag tbg-role-tag--host">Host</span>'
                                            : ""
                                    }
                                </div>
                                ${
                                    handle
                                        ? `<span class="tbg-player-handle">${escapeHtml(handle)}</span>`
                                        : ""
                                }
                            </div>
                        </div>

                        <span class="tbg-ready-pill ${
                            player.isReady
                                ? "tbg-ready-pill--ready"
                                : "tbg-ready-pill--unready"
                        }">
                            ${player.isReady ? "Ready" : "Not Ready"}
                        </span>
                    </li>
                `;
            })
            .join("");

        const emptySlots = Array.from({ length: emptySlotsCount })
            .map(
                () => `
                <li class="tbg-player-slot tbg-player-slot--empty">
                    <span class="tbg-empty-slot-text">Open Pitch Slot</span>
                </li>
            `
            )
            .join("");

        return `
            <article class="tbg-team-card tbg-team-card--${team.toLowerCase()}">
                <header class="tbg-team-card-header">
                    <div class="tbg-team-title-group">
                        <span class="tbg-team-Crest tbg-team-crest--${team.toLowerCase()}"></span>
                        <div>
                            <h2 class="tbg-team-title">${escapeHtml(title)}</h2>
                            <span class="tbg-team-count">${players.length} / ${maxPerTeam} Players</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="tbg-join-team-btn tbg-join-team-btn--${team.toLowerCase()}"
                        data-switch-team="${team}"
                        ${isCurrentTeam || isFull ? "disabled" : ""}
                    >
                        ${
                            isCurrentTeam
                                ? "Joined"
                                : isFull
                                  ? "Full"
                                  : `Join ${team === "RED" ? "Red" : "Blue"}`
                        }
                    </button>
                </header>

                <ul class="tbg-player-list">
                    ${playerRows}
                    ${emptySlots}
                </ul>
            </article>
        `;
    }

    private bindEvents(screen: HTMLElement, state: RoomSessionState): void {
        const copyBtn = screen.querySelector<HTMLButtonElement>("#tbg-copy-code-btn");
        const copyLabel = screen.querySelector<HTMLElement>("#tbg-copy-code-label");
        const leaveBtn = screen.querySelector<HTMLButtonElement>("#tbg-leave-room-btn");
        const readyBtn = screen.querySelector<HTMLButtonElement>("#tbg-toggle-ready-btn");
        const startBtn = screen.querySelector<HTMLButtonElement>("#tbg-start-match-btn");
        const signOutBtn = screen.querySelector<HTMLButtonElement>("#tbg-lobby-signout");
        const teamSwitchBtns = screen.querySelectorAll<HTMLButtonElement>("[data-switch-team]");

        copyBtn?.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(state.code);
                if (copyLabel) {
                    copyLabel.textContent = "Copied!";
                }
                copyBtn.classList.add("tbg-copy-code-btn--copied");

                if (this.copyFeedbackTimeout !== null) {
                    window.clearTimeout(this.copyFeedbackTimeout);
                }
                this.copyFeedbackTimeout = window.setTimeout(() => {
                    if (copyLabel) {
                        copyLabel.textContent = "Copy Code";
                    }
                    copyBtn.classList.remove("tbg-copy-code-btn--copied");
                }, 1800);
            } catch {
                // Fallback if clipboard API is blocked
                if (copyLabel) {
                    copyLabel.textContent = state.code;
                }
            }
        });

        teamSwitchBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetTeam = btn.getAttribute("data-switch-team") as RoomTeam | null;
                if (!targetTeam) return;
                this.session.switchTeam(targetTeam);
                this.render();
            });
        });

        readyBtn?.addEventListener("click", () => {
            this.session.toggleReady();
            this.render();
        });

        startBtn?.addEventListener("click", () => {
            const check = this.session.canStartMatch();
            if (!check.allowed) return;
            this.onStartMatch(this.session.getState());
        });

        leaveBtn?.addEventListener("click", () => {
            this.onLeaveRoom();
        });

        signOutBtn?.addEventListener("click", async () => {
            signOutBtn.disabled = true;
            signOutBtn.textContent = "Signing out...";
            try {
                await auth.signOut();
            } finally {
                this.onSignOut();
            }
        });
    }
}
