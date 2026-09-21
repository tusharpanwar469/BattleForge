import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";

export interface LifecycleOperationResult {
  success: boolean;
  errors: string[];
}

export class FighterLifecycleManager {
  eliminateFighter(
    fighter: FighterState,
    team: TeamState
  ): LifecycleOperationResult {
    const errors: string[] = [];
    const normalizedId = fighter.id.trim().toLowerCase();

    if (!normalizedId) {
      errors.push("Fighter ID cannot be empty.");
      return {
        success: false,
        errors
      };
    }

    if (fighter.teamId !== team.id) {
      errors.push(
        `Fighter "${fighter.id}" does not belong to team "${team.id}".`
      );
      return {
        success: false,
        errors
      };
    }

    if (!fighter.isAlive) {
      errors.push(`Fighter "${fighter.id}" is already eliminated.`);
      return {
        success: false,
        errors
      };
    }

    fighter.isAlive = false;
    fighter.isDeployed = false;

    const rosterIndex = team.roster.findIndex(
      (id) => id.trim().toLowerCase() === normalizedId
    );

    if (rosterIndex !== -1) {
      team.roster.splice(rosterIndex, 1);
    }

    if (
      !team.eliminatedFighters.some(
        (id) => id.trim().toLowerCase() === normalizedId
      )
    ) {
      team.eliminatedFighters.push(normalizedId);
    }

    return {
      success: true,
      errors
    };
  }
}