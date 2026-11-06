import { auth } from "./auth";

type AuthMode = "signin" | "signup";

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    username?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export class AuthUI {
    private container: HTMLElement;
    private rootEl: HTMLElement | null = null;
    private mode: AuthMode = "signin";
    private isLoading = false;
    private onSuccess: (user: AuthenticatedUser) => void;

    constructor(container: HTMLElement, onSuccess: (user: AuthenticatedUser) => void) {
        this.container = container;
        this.onSuccess = onSuccess;
    }

    public mount(initialMode: AuthMode = "signin"): void {
        this.mode = initialMode;
        this.render();
    }

    public destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }

    private switchMode(nextMode: AuthMode): void {
        if (this.isLoading || this.mode === nextMode) return;
        this.mode = nextMode;
        this.render();
    }

    private render(): void {
        if (this.rootEl) {
            this.rootEl.remove();
        }

        const screen = document.createElement("div");
        screen.className = "tbg-auth-screen";

        screen.innerHTML = `
            <div class="tbg-pitch-backdrop" aria-hidden="true">
                <div class="tbg-pitch-glow-orb"></div>
                <svg class="tbg-pitch-svg" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
                    <!-- Outer touchlines & goal lines -->
                    <rect x="60" y="40" width="1080" height="640" rx="6" />
                    <!-- Halfway line -->
                    <line x1="600" y1="40" x2="600" y2="680" />
                    <!-- Center circle & kickoff spot -->
                    <circle cx="600" cy="360" r="92" />
                    <circle cx="600" cy="360" r="4" fill="rgba(34, 197, 94, 0.25)" />
                    <!-- Left penalty area & goal box -->
                    <rect x="60" y="180" width="170" height="360" />
                    <rect x="60" y="265" width="64" height="190" />
                    <path d="M 230 290 A 85 85 0 0 1 230 430" />
                    <!-- Right penalty area & goal box -->
                    <rect x="970" y="180" width="170" height="360" />
                    <rect x="1076" y="265" width="64" height="190" />
                    <path d="M 970 290 A 85 85 0 0 0 970 430" />
                    <!-- Corner arcs -->
                    <path d="M 60 62 A 22 22 0 0 0 82 40" />
                    <path d="M 1118 40 A 22 22 0 0 0 1140 62" />
                    <path d="M 60 658 A 22 22 0 0 1 82 680" />
                    <path d="M 1118 680 A 22 22 0 0 1 1140 658" />
                </svg>
            </div>

            <div class="tbg-auth-container">
                <header class="tbg-brand">
                    <div class="tbg-brand-badge">
                        <span class="tbg-brand-ball-dot"></span>
                        <span class="tbg-brand-pill-text">Multiplayer Pitch Arena</span>
                    </div>
                    <h1 class="tbg-logo">TB<span class="tbg-logo-accent">G</span></h1>
                    <p class="tbg-tagline">The game starts here.</p>
                </header>

                <section class="tbg-auth-card" aria-live="polite">
                    ${this.mode === "signin" ? this.getSignInMarkup() : this.getSignUpMarkup()}
                </section>
            </div>
        `;

        this.container.appendChild(screen);
        this.rootEl = screen;

        this.bindEvents(screen);
    }

    private getSignInMarkup(): string {
        return `
            <div class="tbg-card-header">
                <h2 class="tbg-card-title">Welcome back</h2>
                <p class="tbg-card-subtitle">Sign in to step onto the pitch.</p>
            </div>

            <form class="tbg-form" id="tbg-auth-form" novalidate>
                <div class="tbg-error-banner" id="tbg-error-banner" role="alert" hidden>
                    <svg class="tbg-error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    <span id="tbg-error-text"></span>
                </div>

                <div class="tbg-field">
                    <label class="tbg-label" for="tbg-email">Email</label>
                    <div class="tbg-input-wrapper">
                        <input
                            class="tbg-input"
                            id="tbg-email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            placeholder="player@tbg.gg"
                            required
                        />
                    </div>
                </div>

                <div class="tbg-field">
                    <label class="tbg-label" for="tbg-password">Password</label>
                    <div class="tbg-input-wrapper">
                        <input
                            class="tbg-input tbg-input--with-toggle"
                            id="tbg-password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            class="tbg-password-toggle"
                            data-toggle-password="tbg-password"
                            aria-label="Show password"
                        >
                            Show
                        </button>
                    </div>
                </div>

                <button type="submit" class="tbg-submit-btn" id="tbg-submit-btn">
                    <span id="tbg-submit-label">Sign In</span>
                </button>
            </form>

            <footer class="tbg-auth-footer">
                New to the club?
                <button type="button" class="tbg-switch-link" id="tbg-switch-mode">
                    Create an account
                </button>
            </footer>
        `;
    }

    private getSignUpMarkup(): string {
        return `
            <div class="tbg-card-header">
                <h2 class="tbg-card-title">Create your player profile</h2>
                <p class="tbg-card-subtitle">Register your club credentials to join live matches.</p>
            </div>

            <form class="tbg-form" id="tbg-auth-form" novalidate>
                <div class="tbg-error-banner" id="tbg-error-banner" role="alert" hidden>
                    <svg class="tbg-error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    <span id="tbg-error-text"></span>
                </div>

                <div class="tbg-form-row">
                    <div class="tbg-field">
                        <label class="tbg-label" for="tbg-display-name">Display Name</label>
                        <div class="tbg-input-wrapper">
                            <input
                                class="tbg-input"
                                id="tbg-display-name"
                                name="displayName"
                                type="text"
                                autocomplete="name"
                                placeholder="Alex Hunter"
                                required
                            />
                        </div>
                    </div>

                    <div class="tbg-field">
                        <label class="tbg-label" for="tbg-username">Username</label>
                        <div class="tbg-input-wrapper">
                            <input
                                class="tbg-input"
                                id="tbg-username"
                                name="username"
                                type="text"
                                autocomplete="username"
                                placeholder="alex10"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div class="tbg-field">
                    <label class="tbg-label" for="tbg-email">Email</label>
                    <div class="tbg-input-wrapper">
                        <input
                            class="tbg-input"
                            id="tbg-email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            placeholder="player@tbg.gg"
                            required
                        />
                    </div>
                </div>

                <div class="tbg-field">
                    <label class="tbg-label" for="tbg-password">Password</label>
                    <div class="tbg-input-wrapper">
                        <input
                            class="tbg-input tbg-input--with-toggle"
                            id="tbg-password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            placeholder="At least 8 characters"
                            required
                        />
                        <button
                            type="button"
                            class="tbg-password-toggle"
                            data-toggle-password="tbg-password"
                            aria-label="Show password"
                        >
                            Show
                        </button>
                    </div>
                </div>

                <div class="tbg-field">
                    <label class="tbg-label" for="tbg-confirm-password">Confirm Password</label>
                    <div class="tbg-input-wrapper">
                        <input
                            class="tbg-input tbg-input--with-toggle"
                            id="tbg-confirm-password"
                            name="confirmPassword"
                            type="password"
                            autocomplete="new-password"
                            placeholder="Repeat your password"
                            required
                        />
                        <button
                            type="button"
                            class="tbg-password-toggle"
                            data-toggle-password="tbg-confirm-password"
                            aria-label="Show confirm password"
                        >
                            Show
                        </button>
                    </div>
                </div>

                <button type="submit" class="tbg-submit-btn" id="tbg-submit-btn">
                    <span id="tbg-submit-label">Create Account</span>
                </button>
            </form>

            <footer class="tbg-auth-footer">
                Already have an account?
                <button type="button" class="tbg-switch-link" id="tbg-switch-mode">
                    Sign In
                </button>
            </footer>
        `;
    }

    private bindEvents(screen: HTMLElement): void {
        const form = screen.querySelector<HTMLFormElement>("#tbg-auth-form");
        const switchBtn = screen.querySelector<HTMLButtonElement>("#tbg-switch-mode");
        const toggleButtons = screen.querySelectorAll<HTMLButtonElement>("[data-toggle-password]");

        toggleButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetId = btn.getAttribute("data-toggle-password");
                if (!targetId) return;
                const input = screen.querySelector<HTMLInputElement>(`#${targetId}`);
                if (!input) return;

                const isHidden = input.type === "password";
                input.type = isHidden ? "text" : "password";
                btn.textContent = isHidden ? "Hide" : "Show";
                btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
            });
        });

        switchBtn?.addEventListener("click", () => {
            this.switchMode(this.mode === "signin" ? "signup" : "signin");
        });

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.mode === "signin") {
                void this.handleSignIn(form);
            } else {
                void this.handleSignUp(form);
            }
        });
    }

    private showError(message: string): void {
        if (!this.rootEl) return;
        const banner = this.rootEl.querySelector<HTMLElement>("#tbg-error-banner");
        const text = this.rootEl.querySelector<HTMLElement>("#tbg-error-text");
        if (!banner || !text) return;

        text.textContent = message;
        banner.hidden = false;
    }

    private clearError(): void {
        if (!this.rootEl) return;
        const banner = this.rootEl.querySelector<HTMLElement>("#tbg-error-banner");
        const text = this.rootEl.querySelector<HTMLElement>("#tbg-error-text");
        if (!banner || !text) return;

        text.textContent = "";
        banner.hidden = true;
    }

    private setLoadingState(loading: boolean): void {
        this.isLoading = loading;
        if (!this.rootEl) return;

        const submitBtn = this.rootEl.querySelector<HTMLButtonElement>("#tbg-submit-btn");
        const inputs = this.rootEl.querySelectorAll<HTMLInputElement>(".tbg-input");
        const switchBtn = this.rootEl.querySelector<HTMLButtonElement>("#tbg-switch-mode");

        inputs.forEach((input) => {
            input.disabled = loading;
        });

        if (switchBtn) {
            switchBtn.disabled = loading;
        }

        if (submitBtn) {
            submitBtn.disabled = loading;
            const defaultLabel = this.mode === "signin" ? "Sign In" : "Create Account";
            const loadingLabel = this.mode === "signin" ? "Signing in..." : "Creating account...";

            if (loading) {
                submitBtn.innerHTML = `
                    <span class="tbg-btn-spinner" aria-hidden="true"></span>
                    <span>${loadingLabel}</span>
                `;
            } else {
                submitBtn.innerHTML = `<span id="tbg-submit-label">${defaultLabel}</span>`;
            }
        }
    }

    private async handleSignIn(form: HTMLFormElement): Promise<void> {
        if (this.isLoading) return;
        this.clearError();

        const formData = new FormData(form);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!email || !password) {
            this.showError("Please enter both your email and password.");
            return;
        }

        if (!EMAIL_REGEX.test(email)) {
            this.showError("Please enter a valid email address.");
            return;
        }

        this.setLoadingState(true);

        try {
            const response = await auth.signIn.email({
                email,
                password,
            });

            if (response.error) {
                this.showError(
                    response.error.message || "Invalid email or password. Please try again."
                );
                this.setLoadingState(false);
                return;
            }

            if (response.data?.user) {
                const userRecord = response.data.user as Record<string, unknown>;
                this.onSuccess({
                    id: response.data.user.id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    username:
                        typeof userRecord.username === "string"
                            ? userRecord.username
                            : undefined,
                });
                return;
            }

            this.showError("Unable to complete sign-in. Please try again.");
            this.setLoadingState(false);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "A network error occurred while signing in.";
            this.showError(message);
            this.setLoadingState(false);
        }
    }

    private async handleSignUp(form: HTMLFormElement): Promise<void> {
        if (this.isLoading) return;
        this.clearError();

        const formData = new FormData(form);
        const displayName = String(formData.get("displayName") ?? "").trim();
        const username = String(formData.get("username") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (!displayName || !username || !email || !password || !confirmPassword) {
            this.showError("All fields are required to create an account.");
            return;
        }

        if (username.length < 3 || !/^[a-zA-Z0-9_.-]+$/.test(username)) {
            this.showError(
                "Username must be at least 3 characters and contain only letters, numbers, underscores, dots, or hyphens."
            );
            return;
        }

        if (!EMAIL_REGEX.test(email)) {
            this.showError("Please enter a valid email address.");
            return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            this.showError(
                `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
            );
            return;
        }

        if (password !== confirmPassword) {
            this.showError("Passwords do not match. Please double-check your confirmation.");
            return;
        }

        this.setLoadingState(true);

        try {
            // Preserve the collected username alongside standard Better Auth fields
            // using the SDK's user registration payload / metadata support.
            const signUpPayload = {
                name: displayName,
                email,
                password,
                username,
                data: {
                    username,
                    displayName,
                },
            };

            const response = await auth.signUp.email(
                signUpPayload as Parameters<typeof auth.signUp.email>[0]
            );

            if (response.error) {
                this.showError(
                    response.error.message || "Could not create account. Please try again."
                );
                this.setLoadingState(false);
                return;
            }

            try {
                localStorage.setItem(`tbg_username_${email.toLowerCase()}`, username);
            } catch {
                // Ignore storage quota / privacy mode errors
            }

            if (response.data?.user) {
                this.onSuccess({
                    id: response.data.user.id,
                    name: response.data.user.name || displayName,
                    email: response.data.user.email,
                    username,
                });
                return;
            }

            this.showError("Account created, but session could not be initialized. Please sign in.");
            this.setLoadingState(false);
            this.switchMode("signin");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "A network error occurred while creating your account.";
            this.showError(message);
            this.setLoadingState(false);
        }
    }
}
