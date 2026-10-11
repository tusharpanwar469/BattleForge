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
    private readonly lifecycleManager = new FighterLifecycleManager(),
  ) {}

  applyBattleResult(
    result: BattleResult,
    teamA: TeamState,
    teamB: TeamState,
    fighters: FighterState[],
  ): BattleConsequenceResult {
    const errors: string[] = [];

    if (result.winnerTeamId === result.loserTeamId) {
      return {
        success: false,
        errors: [
          "Battle result cannot have the same winner and loser team.",
        ],
      };
    }

    const teams = [teamA, teamB];
    const winnerTeam = teams.find(
      (team) => team.id === result.winnerTeamId,
    );
    const loserTeam = teams.find(
      (team) => team.id === result.loserTeamId,
    );

    if (!winnerTeam) {
      errors.push(
        `Winner team "${result.winnerTeamId}" is not part of this battle.`,
      );
    }

    if (!loserTeam) {
      errors.push(
        `Loser team "${result.loserTeamId}" is not part of this battle.`,
      );
    }

    if (errors.length > 0 || !winnerTeam || !loserTeam) {
      return { success: false, errors };
    }

    const rosterIds = loserTeam.roster.map((id) =>
      typeof id === "string" ? id.trim().toLowerCase() : "",
    );

    if (rosterIds.some((id) => !id)) {
      errors.push(
        `Losing team "${loserTeam.id}" contains an empty roster fighter ID.`,
      );
    }

    if (new Set(rosterIds).size !== rosterIds.length) {
      errors.push(
        `Losing team "${loserTeam.id}" contains duplicate roster fighter IDs.`,
      );
    }

    const fightersById = new Map<string, FighterState[]>();

    for (const fighter of fighters) {
      const normalizedId =
        typeof fighter.id === "string"
          ? fighter.id.trim().toLowerCase()
          : "";

      if (!normalizedId) {
        if (fighter.teamId === loserTeam.id) {
          errors.push(
            `Losing team "${loserTeam.id}" has a fighter with an empty ID.`,
          );
        }
        continue;
      }

      const matchingFighters = fightersById.get(normalizedId) ?? [];
      matchingFighters.push(fighter);
      fightersById.set(normalizedId, matchingFighters);
    }

    const losingFighters: FighterState[] = [];

    for (const rosterId of rosterIds) {
      if (!rosterId) {
        continue;
      }

      const matches = fightersById.get(rosterId) ?? [];

      if (matches.length === 0) {
        errors.push(
          `Losing team "${loserTeam.id}" roster fighter "${rosterId}" has no matching fighter state.`,
        );
        continue;
      }

      if (matches.length > 1) {
        errors.push(
          `Losing team "${loserTeam.id}" roster fighter "${rosterId}" has multiple matching fighter states.`,
        );
        continue;
      }

      const fighter = matches[0];

      if (fighter.teamId !== loserTeam.id) {
        errors.push(
          `Fighter "${fighter.id}" does not belong to team "${loserTeam.id}".`,
        );
        continue;
      }

      losingFighters.push(fighter);
    }

    const rosterIdSet = new Set(rosterIds.filter(Boolean));

    for (const fighter of fighters) {
      if (
        fighter.teamId === loserTeam.id &&
        !rosterIdSet.has(
          typeof fighter.id === "string"
            ? fighter.id.trim().toLowerCase()
            : "",
        )
      ) {
        errors.push(
          `Fighter "${fighter.id}" belongs to losing team "${loserTeam.id}" but is missing from its roster.`,
        );
      }
    }

    for (const fighter of losingFighters) {
      const validation = this.validateFighterForElimination(
        fighter,
        loserTeam,
      );
      errors.push(...validation.errors);
    }

    // Never partially eliminate a team when preflight validation fails.
    if (errors.length > 0) {
      return { success: false, errors };
    }

    for (const fighter of losingFighters) {
      const consequence = this.lifecycleManager.eliminateFighter(
        fighter,
        loserTeam,
      );

      if (!consequence.success) {
        errors.push(...consequence.errors);
        break;
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  private validateFighterForElimination(
    fighter: FighterState,
    team: TeamState,
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!fighter.id.trim()) {
      errors.push("Fighter ID cannot be empty.");
    }

    if (fighter.teamId !== team.id) {
      errors.push(
        `Fighter "${fighter.id}" does not belong to team "${team.id}".`,
      );
    }

    if (!fighter.isAlive) {
      errors.push(
        `Fighter "${fighter.id}" is already eliminated.`,
      );
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}