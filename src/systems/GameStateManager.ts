import type { GameState } from "../core/GameState";

export class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = {
      phase: "menu",
      round: 1,
      isPaused: false,
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  setPhase(phase: GameState["phase"]): void {
    this.state.phase = phase;
  }

  getPhase(): GameState["phase"] {
    return this.state.phase;
  }

  setRound(round: number): void {
    if (round < 1) {
      throw new Error("Round must be at least 1.");
    }

    this.state.round = round;
  }

  nextRound(): void {
    this.state.round += 1;
  }

  getRound(): number {
    return this.state.round;
  }

  setPaused(isPaused: boolean): void {
    this.state.isPaused = isPaused;
  }

  togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }

  reset(): void {
    this.state = {
      phase: "menu",
      round: 1,
      isPaused: false,
    };
  }
}