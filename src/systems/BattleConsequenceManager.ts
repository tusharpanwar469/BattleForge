import type { BattleResult } from "../core/BattleResult";
import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";
import { FighterLifecycleManager } from "./FighterLifecycleManager";

export interface BattleConsequenceResult {
  success: boolean;
  errors: string[];
}

export class BattleConsequenceManager {
  constructor(
    private readonly lifecycleManager = new FighterLifecycleManager()
  ) {}

  applyBattleResult(
    result: BattleResult,
    teamA: TeamState,
    teamB: TeamState,
    fighters: FighterState[]
  ): BattleConsequenceResult {
    const errors: string[] = [];

    if (result.winnerTeamId === result.loserTeamId) {
      errors.push("Battle result cannot have the same winner and loser team.");
      return {
        success: false,
        errors
      };
    }

    const teams = [teamA, teamB];

    const winnerTeam = teams.find(
      (team) => team.id === result.winnerTeamId
    );

    const loserTeam = teams.find(
      (team) => team.id === result.loserTeamId
    );

    if (!winnerTeam) {
      errors.push(
        `Winner team "${result.winnerTeamId}" is not part of this battle.`
      );
    }

    if (!loserTeam) {
      errors.push(
        `Loser team "${result.loserTeamId}" is not part of this battle.`
      );
    }

    if (errors.length > 0 || !winnerTeam || !loserTeam) {
      return {
        success: false,
        errors
      };
    }

    const losingFighters = fighters.filter(
      (fighter) =>
        fighter.teamId === loserTeam.id &&
        fighter.isAlive
    );

    for (const fighter of losingFighters) {
      const consequence = this.lifecycleManager.eliminateFighter(
        fighter,
        loserTeam
      );

      if (!consequence.success) {
        errors.push(...consequence.errors);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}