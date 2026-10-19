export class Input {
    private keys: Record<string, boolean> = {};
    private previousKeys: Record<string, boolean> = {};

    constructor() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

        // Release all keys when the browser window loses focus.
        window.addEventListener("blur", () => {
            this.clearKeys();
        });

        // Also release keys when switching to another browser tab.
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.clearKeys();
            }
        });
    }

    private clearKeys(): void {
        this.keys = {};
        this.previousKeys = {};
    }

    isDown(code: string): boolean {
        return this.keys[code] === true;
    }

    isPressed(code: string): boolean {
        return (
            this.keys[code] === true &&
            this.previousKeys[code] !== true
        );
    }

    endFrame(): void {
        this.previousKeys = { ...this.keys };
    }
}