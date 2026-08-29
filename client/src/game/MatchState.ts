import { GameState } from "./GameState";

export class MatchState {

    state: GameState = GameState.PLAYING;

    scoreLeft = 0;
    scoreRight = 0;

    matchTime = 0;
    goalPauseTime = 0; //to check how long has matchState been in goalScored state
}