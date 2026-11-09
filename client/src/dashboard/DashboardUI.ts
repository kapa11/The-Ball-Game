import { auth } from "../auth/auth";
import type { AuthenticatedUser } from "../auth/AuthUI";
import { RoomActionsPanel } from "../rooms/RoomActionsPanel";
import type { CreateRoomInput, JoinRoomInput } from "../rooms/roomTypes";

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

export class DashboardUI {
    private readonly container: HTMLElement;
    private rootEl: HTMLElement | null = null;
    private readonly user: AuthenticatedUser;
    private readonly roomActionsPanel: RoomActionsPanel;
    private readonly onSignOut: () => void;

    constructor(
        container: HTMLElement,
        user: AuthenticatedUser,
        callbacks: {
            onCreateRoom: (input: CreateRoomInput) => void;
            onJoinRoom: (input: JoinRoomInput) => void;
            onSignOut: () => void;
        }
    ) {
        this.container = container;
        this.user = user;
        this.onSignOut = callbacks.onSignOut;
        this.roomActionsPanel = new RoomActionsPanel(
            callbacks.onCreateRoom,
            callbacks.onJoinRoom
        );
    }

    public mount(): void {
        this.render();
    }

    public destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }

    private render(): void {
        if (this.rootEl) {
            this.rootEl.remove();
        }

        const displayName =
            this.user.name || this.user.username || this.user.email.split("@")[0];
        const handleText = this.user.username
            ? `@${this.user.username}`
            : this.user.email;
        const initials = getInitials(displayName);

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
                <!-- Top Navigation / Account Header -->
                <header class="tbg-topbar">
                    <div class="tbg-topbar-brand">
                        <div class="tbg-logo tbg-logo--sm">
                            TB<span class="tbg-logo-accent">G</span>
                        </div>
                        <span class="tbg-topbar-divider" aria-hidden="true"></span>
                        <span class="tbg-topbar-tag">Clubhouse Dashboard</span>
                    </div>

                    <div class="tbg-topbar-account">
                        <div class="tbg-account-pill" title="${escapeHtml(this.user.email)}">
                            <span class="tbg-account-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
                            <div class="tbg-account-meta">
                                <span class="tbg-account-name">${escapeHtml(displayName)}</span>
                                <span class="tbg-account-handle">${escapeHtml(handleText)}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="tbg-btn-outline tbg-btn-outline--danger"
                            id="tbg-dashboard-signout"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <!-- Hero Welcome Section -->
                <main class="tbg-dashboard-main">
                    <section class="tbg-welcome-banner">
                        <div class="tbg-welcome-copy">
                            <div class="tbg-brand-badge">
                                <span class="tbg-brand-ball-dot"></span>
                                <span class="tbg-brand-pill-text">Private Rooms V1</span>
                            </div>
                            <h1 class="tbg-welcome-title">
                                Welcome to the pitch, <span class="tbg-text-accent">${escapeHtml(displayName)}</span>
                            </h1>
                            <p class="tbg-welcome-subtitle">
                                Host a private match room for your squad or enter a room code to join a friend's lobby.
                            </p>
                        </div>
                    </section>

                    <!-- Create / Join Room Cards -->
                    ${this.roomActionsPanel.getMarkup()}
                </main>
            </div>
        `;

        this.container.appendChild(screen);
        this.rootEl = screen;

        this.roomActionsPanel.bindEvents(screen);

        const signOutBtn = screen.querySelector<HTMLButtonElement>(
            "#tbg-dashboard-signout"
        );
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
