import type { BattleResult } from "../core/BattleResult";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";

export class BattleEngine {
  resolveBattle(
    gameState: GameState,
    teamA: TeamState,
    teamB: TeamState
  ): BattleResult {
    void gameState;
    void teamA;
    void teamB;

    return {
      winnerTeamId: "",
      loserTeamId: "",
      round: 0,
      reason: "Battle resolution not implemented yet.",
      factors: {}
    };
  }
}
