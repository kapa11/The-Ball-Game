import { Input } from "./Input";
import type { PlayerInput } from "./PlayerInput";

export class PlayerInputReader {
    private input: Input;

    constructor(input: Input) {
        this.input = input;
    }

    read(): PlayerInput {
        return {
            up: this.input.isDown("KeyW"),
            down: this.input.isDown("KeyS"),
            left: this.input.isDown("KeyA"),
            right: this.input.isDown("KeyD"),
            kick: this.input.isPressed("Space")
        };
    }

    endFrame() {
        this.input.endFrame();
    }
}