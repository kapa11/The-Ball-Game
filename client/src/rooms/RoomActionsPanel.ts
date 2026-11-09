import type {
    CreateRoomInput,
    JoinRoomInput,
    MaxPlayersOption,
} from "./roomTypes";
import { normalizeRoomCode } from "./mockRoomSession";

const ALLOWED_MAX_PLAYERS: readonly MaxPlayersOption[] = [2, 4, 6];

export class RoomActionsPanel {
    private readonly onCreateRoom: (input: CreateRoomInput) => void;
    private readonly onJoinRoom: (input: JoinRoomInput) => void;

    constructor(
        onCreateRoom: (input: CreateRoomInput) => void,
        onJoinRoom: (input: JoinRoomInput) => void
    ) {
        this.onCreateRoom = onCreateRoom;
        this.onJoinRoom = onJoinRoom;
    }

    public getMarkup(): string {
        return `
            <div class="tbg-dashboard-grid">
                <!-- Create a Room Card -->
                <article class="tbg-panel-card tbg-panel-card--create">
                    <div class="tbg-panel-card-header">
                        <div class="tbg-panel-icon tbg-panel-icon--green" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <div>
                            <span class="tbg-panel-eyebrow">Host Match</span>
                            <h2 class="tbg-panel-title">Create a Room</h2>
                        </div>
                    </div>

                    <p class="tbg-panel-description">
                        Set up a private pitch, configure match capacity, and share your unique room code with friends.
                    </p>

                    <form class="tbg-form" id="tbg-create-room-form" novalidate>
                        <div class="tbg-error-banner" id="tbg-create-error" role="alert" hidden>
                            <svg class="tbg-error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                            <span id="tbg-create-error-text"></span>
                        </div>

                        <div class="tbg-field">
                            <label class="tbg-label" for="tbg-room-name">
                                Room Name <span class="tbg-label-optional">(Optional)</span>
                            </label>
                            <div class="tbg-input-wrapper">
                                <input
                                    class="tbg-input"
                                    id="tbg-room-name"
                                    name="roomName"
                                    type="text"
                                    maxlength="36"
                                    placeholder="Champions Arena"
                                />
                            </div>
                        </div>

                        <div class="tbg-form-row">
                            <div class="tbg-field">
                                <label class="tbg-label" for="tbg-create-password">Room Password</label>
                                <div class="tbg-input-wrapper">
                                    <input
                                        class="tbg-input tbg-input--with-toggle"
                                        id="tbg-create-password"
                                        name="password"
                                        type="password"
                                        maxlength="32"
                                        placeholder="Set passkey"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="tbg-password-toggle"
                                        data-toggle-password="tbg-create-password"
                                        aria-label="Show password"
                                    >
                                        Show
                                    </button>
                                </div>
                            </div>

                            <div class="tbg-field">
                                <label class="tbg-label" for="tbg-max-players">Max Players</label>
                                <div class="tbg-input-wrapper">
                                    <select class="tbg-input tbg-select" id="tbg-max-players" name="maxPlayers">
                                        <option value="2">2 Players (1v1)</option>
                                        <option value="4" selected>4 Players (2v2)</option>
                                        <option value="6">6 Players (3v3)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="tbg-submit-btn">
                            <span>Create Room</span>
                        </button>
                    </form>
                </article>

                <!-- Join a Room Card -->
                <article class="tbg-panel-card tbg-panel-card--join">
                    <div class="tbg-panel-card-header">
                        <div class="tbg-panel-icon tbg-panel-icon--teal" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </div>
                        <div>
                            <span class="tbg-panel-eyebrow">Enter Code</span>
                            <h2 class="tbg-panel-title">Join a Room</h2>
                        </div>
                    </div>

                    <p class="tbg-panel-description">
                        Have an invite from a friend? Enter the 6-character room code and room password to join the lobby.
                    </p>

                    <form class="tbg-form" id="tbg-join-room-form" novalidate>
                        <div class="tbg-error-banner" id="tbg-join-error" role="alert" hidden>
                            <svg class="tbg-error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                            <span id="tbg-join-error-text"></span>
                        </div>

                        <div class="tbg-field">
                            <label class="tbg-label" for="tbg-join-code">Room Code</label>
                            <div class="tbg-input-wrapper">
                                <input
                                    class="tbg-input tbg-input--code"
                                    id="tbg-join-code"
                                    name="roomCode"
                                    type="text"
                                    maxlength="8"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="E.G. K9X4P2"
                                    required
                                />
                            </div>
                        </div>

                        <div class="tbg-field">
                            <label class="tbg-label" for="tbg-join-password">Room Password</label>
                            <div class="tbg-input-wrapper">
                                <input
                                    class="tbg-input tbg-input--with-toggle"
                                    id="tbg-join-password"
                                    name="password"
                                    type="password"
                                    maxlength="32"
                                    placeholder="Enter room passkey"
                                    required
                                />
                                <button
                                    type="button"
                                    class="tbg-password-toggle"
                                    data-toggle-password="tbg-join-password"
                                    aria-label="Show password"
                                >
                                    Show
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="tbg-submit-btn tbg-submit-btn--secondary">
                            <span>Join Room</span>
                        </button>
                    </form>
                </article>
            </div>
        `;
    }

    public bindEvents(root: HTMLElement): void {
        const createForm = root.querySelector<HTMLFormElement>("#tbg-create-room-form");
        const joinForm = root.querySelector<HTMLFormElement>("#tbg-join-room-form");
        const codeInput = root.querySelector<HTMLInputElement>("#tbg-join-code");
        const toggleButtons = root.querySelectorAll<HTMLButtonElement>("[data-toggle-password]");

        toggleButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetId = btn.getAttribute("data-toggle-password");
                if (!targetId) return;
                const input = root.querySelector<HTMLInputElement>(`#${targetId}`);
                if (!input) return;

                const isHidden = input.type === "password";
                input.type = isHidden ? "text" : "password";
                btn.textContent = isHidden ? "Hide" : "Show";
                btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
            });
        });

        codeInput?.addEventListener("input", () => {
            const caret = codeInput.selectionStart ?? codeInput.value.length;
            codeInput.value = normalizeRoomCode(codeInput.value);
            codeInput.setSelectionRange(caret, caret);
        });

        createForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleCreateSubmit(root, createForm);
        });

        joinForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleJoinSubmit(root, joinForm);
        });
    }

    private handleCreateSubmit(root: HTMLElement, form: HTMLFormElement): void {
        this.setBannerError(root, "create", null);

        const formData = new FormData(form);
        const roomName = String(formData.get("roomName") ?? "").trim();
        const password = String(formData.get("password") ?? "").trim();
        const rawMax = Number(formData.get("maxPlayers") ?? 4);

        if (roomName.length > 36) {
            this.setBannerError(
                root,
                "create",
                "Room name must be 36 characters or fewer."
            );
            return;
        }

        if (!password || password.length < 3) {
            this.setBannerError(
                root,
                "create",
                "Please set a room password (at least 3 characters) for your private room."
            );
            return;
        }

        const maxPlayers: MaxPlayersOption = ALLOWED_MAX_PLAYERS.includes(
            rawMax as MaxPlayersOption
        )
            ? (rawMax as MaxPlayersOption)
            : 4;

        this.onCreateRoom({
            roomName: roomName || undefined,
            password,
            maxPlayers,
        });
    }

    private handleJoinSubmit(root: HTMLElement, form: HTMLFormElement): void {
        this.setBannerError(root, "join", null);

        const formData = new FormData(form);
        const rawCode = String(formData.get("roomCode") ?? "");
        const roomCode = normalizeRoomCode(rawCode);
        const password = String(formData.get("password") ?? "").trim();

        if (!roomCode) {
            this.setBannerError(root, "join", "Please enter a room code.");
            return;
        }

        if (roomCode.length < 4 || roomCode.length > 8) {
            this.setBannerError(
                root,
                "join",
                "Room code must be between 4 and 8 alphanumeric characters."
            );
            return;
        }

        if (!password) {
            this.setBannerError(
                root,
                "join",
                "Please enter the room password to join this private room."
            );
            return;
        }

        this.onJoinRoom({
            roomCode,
            password,
        });
    }

    private setBannerError(
        root: HTMLElement,
        target: "create" | "join",
        message: string | null
    ): void {
        const banner = root.querySelector<HTMLElement>(`#tbg-${target}-error`);
        const text = root.querySelector<HTMLElement>(`#tbg-${target}-error-text`);
        if (!banner || !text) return;

        if (!message) {
            text.textContent = "";
            banner.hidden = true;
        } else {
            text.textContent = message;
            banner.hidden = false;
        }
    }
}
