import type { BattleDeployment } from "../core/BattleDeployment";
import type { BattleResult } from "../core/BattleResult";
import type { FighterState } from "../core/FighterState";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import { BattleResolutionOrchestrator } from "./BattleResolutionOrchestrator";
import { WarProgressionManager } from "./WarProgressionManager";
import {
  validateWarReadiness
} from "./WarReadinessValidator";
import type { FighterRegistry } from "./FighterRegistry";
import type { BattleResolutionResult } from "./BattleResolutionOrchestrator";

export interface GameplayBattleOutcome {
  gameState: GameState;
  resolution: BattleResolutionResult;
}

export class GameplayController {
  constructor(
    private readonly battleOrchestrator: BattleResolutionOrchestrator,
    private readonly progressionManager: WarProgressionManager
  ) {}

  startWar(
    gameState: GameState,
    teams: TeamState[],
    fighters: FighterState[]
  ): GameState {
    if (gameState.phase !== "auction") {
      throw new Error(
        `The war can only start from the auction phase. Current phase: "${gameState.phase}".`
      );
    }

    if (teams.length < 2) {
      throw new Error("The war requires at least 2 teams.");
    }

    const readiness = validateWarReadiness(teams, fighters);

    if (!readiness.isReady) {
      throw new Error(readiness.errors.join(" "));
    }

    return {
      ...gameState,
      phase: "battle"
    };
  }

  resolveBattle(
    gameState: GameState,
    teamA: TeamState,
    deploymentA: BattleDeployment,
    teamB: TeamState,
    deploymentB: BattleDeployment,
    fighters: FighterState[],
    registry: FighterRegistry,
    allTeams: TeamState[]
  ): GameplayBattleOutcome {
    if (gameState.phase !== "battle") {
      throw new Error(
        `A battle can only be resolved during the battle phase. Current phase: "${gameState.phase}".`
      );
    }

    const resolution = this.battleOrchestrator.resolveBattle(
      gameState,
      teamA,
      deploymentA,
      teamB,
      deploymentB,
      fighters,
      registry,
      allTeams
    );

    const nextGameState = this.progressionManager.advanceAfterBattle(
      gameState,
      resolution.battleResult
    );

    return {
      gameState: nextGameState,
      resolution
    };
  }

  beginNextRound(
    gameState: GameState,
    previousOutcome: GameplayBattleOutcome
  ): GameState {
    if (gameState.phase !== "results") {
      throw new Error(
        `The next round can only begin from the results phase. Current phase: "${gameState.phase}".`
      );
    }

    if (previousOutcome.resolution.warComplete) {
      throw new Error("The war is complete; no further rounds can begin.");
    }

    if (
      previousOutcome.resolution.battleResult.round !== gameState.round
    ) {
      throw new Error(
        "The previous battle outcome does not match the current game round."
      );
    }

  return this.progressionManager.beginNextRound(
  gameState,
  previousOutcome.resolution.warComplete
);
  }

  getBattleResult(
    outcome: GameplayBattleOutcome
  ): BattleResult {
    return outcome.resolution.battleResult;
  }
}