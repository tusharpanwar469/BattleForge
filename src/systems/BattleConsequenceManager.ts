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

    // Validate the battle result.
    if (result.winnerTeamId === result.loserTeamId) {
      return {
        success: false,
        errors: [
          "Battle result cannot have the same winner and loser team."
        ]
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

    // Collect every fighter belonging to the losing team.
    const losingFighters = fighters.filter(
  (fighter) =>
    fighter.teamId === loserTeam.id ||
    loserTeam.roster.some(
      (id) => id.trim().toLowerCase() === fighter.id.trim().toLowerCase()
    )
);

    // Preflight: validate all losing fighters before changing any state.
    for (const fighter of losingFighters) {
      const validation = this.validateFighterForElimination(
        fighter,
        loserTeam
      );

      if (!validation.success) {
        errors.push(...validation.errors);
      }
    }

    // Do not partially eliminate the team if preflight validation fails.
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    // Apply eliminations only after every fighter passes preflight.
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

  private validateFighterForElimination(
    fighter: FighterState,
    team: TeamState
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    const normalizedId = fighter.id.trim().toLowerCase();

    if (!normalizedId) {
      errors.push("Fighter ID cannot be empty.");
    }

    if (fighter.teamId !== team.id) {
      errors.push(
        `Fighter "${fighter.id}" does not belong to team "${team.id}".`
      );
    }

    if (!fighter.isAlive) {
      errors.push(
        `Fighter "${fighter.id}" is already eliminated.`
      );
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}