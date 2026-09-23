import type { BattleDeployment } from "../core/BattleDeployment";
import type { BattleResult } from "../core/BattleResult";
import type { FighterState } from "../core/FighterState";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import { BattleConsequenceManager } from "./BattleConsequenceManager";
import { BattleEngine } from "./BattleEngine";
import type { FighterRegistry } from "./FighterRegistry";
import { validateWarCompletion } from "./WarCompletionValidator";

export interface BattleResolutionResult {
  battleResult: BattleResult;
  warComplete: boolean;
  winnerTeamId: string | null;
}

export class BattleResolutionOrchestrator {
  constructor(
    private readonly engine: BattleEngine,
    private readonly consequenceManager: BattleConsequenceManager
  ) {}

  resolveBattle(
    gameState: GameState,
    teamA: TeamState,
    deploymentA: BattleDeployment,
    teamB: TeamState,
    deploymentB: BattleDeployment,
    fighters: FighterState[],
    registry: FighterRegistry,
    allTeams: TeamState[]
  ): BattleResolutionResult {
    const battleResult = this.engine.resolveBattle(
      gameState,
      teamA,
      deploymentA,
      teamB,
      deploymentB,
      registry
    );

    const consequenceResult =
      this.consequenceManager.applyBattleResult(
        battleResult,
        teamA,
        teamB,
        fighters
      );

    if (!consequenceResult.success) {
      throw new Error(consequenceResult.errors.join(" "));
    }

    const completionResult = validateWarCompletion(allTeams);

    return {
      battleResult,
      warComplete: completionResult.isComplete,
      winnerTeamId: completionResult.winnerTeamId
    };
  }
}