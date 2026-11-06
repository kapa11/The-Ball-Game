import "./style.css";
import { Application } from "pixi.js";
import { GameClient } from "./GameClient";
import { auth } from "./auth/auth";
import { AuthUI, type AuthenticatedUser } from "./auth/AuthUI";

const appContainer = document.getElementById("app") ?? document.body;

let gameStarted = false;

async function startGame(user: AuthenticatedUser): Promise<void> {
    if (gameStarted) return;
    gameStarted = true;

    appContainer.innerHTML = "";

    // Minimal top-right session HUD bar (Sign Out)
    const hud = document.createElement("div");
    hud.className = "tbg-game-hud";
    const displayLabel = user.username || user.name || user.email;
    hud.innerHTML = `
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

            await startGame({
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

    const authUI = new AuthUI(appContainer, (user) => {
        authUI.destroy();
        void startGame(user);
    });

    authUI.mount("signin");
}

void bootstrap();
