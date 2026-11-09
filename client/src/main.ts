import "./style.css";
import { Application } from "pixi.js";
import { GameClient } from "./GameClient";
import { auth } from "./auth/auth";
import { AuthUI, type AuthenticatedUser } from "./auth/AuthUI";
import { DashboardUI } from "./dashboard/DashboardUI";
import { RoomLobbyUI } from "./lobby/RoomLobbyUI";
import { ClientRoomSession } from "./rooms/mockRoomSession";
import type { RoomSessionState } from "./rooms/roomTypes";

const appContainer = document.getElementById("app") ?? document.body;

let gameStarted = false;

async function startGame(
    user: AuthenticatedUser,
    room?: RoomSessionState
): Promise<void> {
    if (gameStarted) return;
    gameStarted = true;

    appContainer.innerHTML = "";

    // Minimal top-right session HUD bar (Room Code + User + Sign Out)
    const hud = document.createElement("div");
    hud.className = "tbg-game-hud";
    const displayLabel = user.username || user.name || user.email;
    const roomBadge = room
        ? `<span class="tbg-hud-room" title="${room.name}">ROOM ${room.code}</span>`
        : "";
    hud.innerHTML = `
        ${roomBadge}
        <span class="tbg-hud-user" title="${user.email}">${displayLabel}</span>
        <button type="button" class="tbg-signout-btn" id="tbg-signout-btn">Sign Out</button>
    `;
    document.body.appendChild(hud);

    const signOutBtn = hud.querySelector<HTMLButtonElement>("#tbg-signout-btn");
    signOutBtn?.addEventListener("click", async () => {
        signOutBtn.disabled = true;
        signOutBtn.textContent = "Signing out...";
        try {
            await auth.signOut();
        } finally {
            window.location.reload();
        }
    });

    // Existing PixiJS game initialization logic
    const app = new Application();

    await app.init({
        width: 1400,
        height: 800,
        backgroundColor: 0x111111,
    });

    document.body.appendChild(app.canvas);

    const gameClient = new GameClient(app);

    app.ticker.add((ticker) => {
        gameClient.update(ticker.deltaMS / 1000);
    });
}

function showAuthScreen(): void {
    appContainer.innerHTML = "";

    const authUI = new AuthUI(appContainer, (user) => {
        authUI.destroy();
        showDashboard(user);
    });

    authUI.mount("signin");
}

function showDashboard(user: AuthenticatedUser): void {
    appContainer.innerHTML = "";

    const dashboardUI = new DashboardUI(appContainer, user, {
        onCreateRoom: (input) => {
            dashboardUI.destroy();
            const roomSession = ClientRoomSession.fromCreate(user, input);
            showRoomLobby(user, roomSession);
        },
        onJoinRoom: (input) => {
            dashboardUI.destroy();
            const roomSession = ClientRoomSession.fromJoin(user, input);
            showRoomLobby(user, roomSession);
        },
        onSignOut: () => {
            dashboardUI.destroy();
            showAuthScreen();
        },
    });

    dashboardUI.mount();
}

function showRoomLobby(
    user: AuthenticatedUser,
    roomSession: ClientRoomSession
): void {
    appContainer.innerHTML = "";

    const lobbyUI = new RoomLobbyUI(appContainer, user, roomSession, {
        onStartMatch: (roomState) => {
            lobbyUI.destroy();
            void startGame(user, roomState);
        },
        onLeaveRoom: () => {
            lobbyUI.destroy();
            showDashboard(user);
        },
        onSignOut: () => {
            lobbyUI.destroy();
            showAuthScreen();
        },
    });

    lobbyUI.mount();
}

function showBootLoader(): HTMLElement {
    const loader = document.createElement("div");
    loader.className = "tbg-boot-loader";
    loader.innerHTML = `
        <div class="tbg-boot-spinner" aria-hidden="true"></div>
        <div class="tbg-boot-text">Connecting to TBG...</div>
    `;
    appContainer.appendChild(loader);
    return loader;
}

async function bootstrap(): Promise<void> {
    const loader = showBootLoader();

    try {
        const sessionRes = await auth.getSession();
        const sessionUser = sessionRes.data?.user;

        if (sessionUser) {
            loader.remove();
            const userRecord = sessionUser as Record<string, unknown>;
            const storedUsername = localStorage.getItem(
                `tbg_username_${sessionUser.email.toLowerCase()}`
            );

            showDashboard({
                id: sessionUser.id,
                name: sessionUser.name,
                email: sessionUser.email,
                username:
                    typeof userRecord.username === "string"
                        ? userRecord.username
                        : storedUsername ?? undefined,
            });
            return;
        }
    } catch {
        // If session check fails (e.g. unauthenticated or offline), fall through to Auth UI
    }

    loader.remove();
    showAuthScreen();
}

void bootstrap();
