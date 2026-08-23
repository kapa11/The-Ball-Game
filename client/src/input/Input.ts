export class Input {
    private keys: Record<string, boolean> = {};
    private previousKeys: Record<string,boolean> = {};

    constructor() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code: string): boolean {
        return this.keys[code] === true;
    }

    isPressed(code: string): boolean { //positive edge detection for the Kick operation
        return (
            this.keys[code] === true &&
            this.previousKeys[code] !== true
        );
    }

    endFrame(): void{
        this.previousKeys = { ...this.keys }; 
    }
}