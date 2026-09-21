import type { TeamState } from "../core/TeamState";
import { TEAM_MAX_ROSTER } from "../core/TeamState";
import type { FighterRegistry } from "./FighterRegistry";

export interface RosterOperationResult {
  success: boolean;
  errors: string[];
}

export class TeamRosterManager {
  constructor(private readonly registry: FighterRegistry) {}

  addFighter(
    team: TeamState,
    fighterId: string
  ): RosterOperationResult {
    const errors: string[] = [];
    const normalizedId = fighterId.trim().toLowerCase();

    if (!normalizedId) {
      errors.push("Fighter ID cannot be empty.");
      return { success: false, errors };
    }

    if (!this.registry.has(normalizedId)) {
      errors.push(`Fighter "${fighterId}" is not registered.`);
      return { success: false, errors };
    }

    if (team.eliminatedFighters.includes(normalizedId)) {
      errors.push(
        `Fighter "${fighterId}" is eliminated and cannot be added to the roster.`
      );
      return { success: false, errors };
    }

    if (team.roster.some((id) => id.toLowerCase() === normalizedId)) {
      errors.push(`Fighter "${fighterId}" is already on the team roster.`);
      return { success: false, errors };
    }

    if (team.roster.length >= TEAM_MAX_ROSTER) {
      errors.push(
        `Team roster cannot contain more than ${TEAM_MAX_ROSTER} fighters.`
      );
      return { success: false, errors };
    }

    team.roster.push(normalizedId);

    return {
      success: true,
      errors
    };
  }

  removeFighter(
    team: TeamState,
    fighterId: string
  ): RosterOperationResult {
    const errors: string[] = [];
    const normalizedId = fighterId.trim().toLowerCase();

    if (!normalizedId) {
      errors.push("Fighter ID cannot be empty.");
      return { success: false, errors };
    }

    const fighterIndex = team.roster.findIndex(
      (id) => id.toLowerCase() === normalizedId
    );

    if (fighterIndex === -1) {
      errors.push(`Fighter "${fighterId}" is not on the team roster.`);
      return { success: false, errors };
    }

    team.roster.splice(fighterIndex, 1);

    return {
      success: true,
      errors
    };
  }
}
