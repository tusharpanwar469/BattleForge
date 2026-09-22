import type { BattleResult } from "../core/BattleResult";
import type { GameState } from "../core/GameState";

export class WarProgressionManager {
  advanceAfterBattle(
    gameState: GameState,
    battleResult: BattleResult
  ): GameState {
    if (gameState.phase !== "battle") {
      throw new Error(
        `War progression requires the game to be in the battle phase. Current phase: "${gameState.phase}".`
      );
    }

    if (!battleResult.winnerTeamId || !battleResult.loserTeamId) {
      throw new Error(
        "War progression requires a resolved battle result."
      );
    }

    if (battleResult.round !== gameState.round) {
      throw new Error(
        `Battle result round "${battleResult.round}" does not match game round "${gameState.round}".`
      );
    }

    return {
      ...gameState,
      phase: "results",
      round: gameState.round
    };
  }

  beginNextRound(gameState: GameState): GameState {
    if (gameState.phase !== "results") {
      throw new Error(
        `The next round can only begin from the results phase. Current phase: "${gameState.phase}".`
      );
    }

    return {
      ...gameState,
      phase: "battle",
      round: gameState.round + 1
    };
  }
}