export interface GameState {
  phase: "menu" | "auction" | "battle" | "results";
  round: number;
  isPaused: boolean;
}
