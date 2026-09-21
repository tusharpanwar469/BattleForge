import type { BattleDeployment } from "../core/BattleDeployment";
import type { TeamState } from "../core/TeamState";

export interface BattleDeploymentValidationResult {
  isValid: boolean;
  errors: string[];
}

export const MIN_DEPLOYED_FIGHTERS = 1;
export const MAX_DEPLOYED_FIGHTERS = 4;

export function validateBattleDeployment(
  deployment: BattleDeployment,
  team: TeamState
): BattleDeploymentValidationResult {
  const errors: string[] = [];

  if (deployment.teamId !== team.id) {
    errors.push(
      `Deployment team "${deployment.teamId}" does not match team "${team.id}".`
    );
  }

  if (deployment.fighterIds.length < MIN_DEPLOYED_FIGHTERS) {
    errors.push(
      `Deployment must contain at least ${MIN_DEPLOYED_FIGHTERS} fighter.`
    );
  }

  if (deployment.fighterIds.length > MAX_DEPLOYED_FIGHTERS) {
    errors.push(
      `Deployment cannot contain more than ${MAX_DEPLOYED_FIGHTERS} fighters.`
    );
  }

  const uniqueFighterIds = new Set(deployment.fighterIds);

  if (uniqueFighterIds.size !== deployment.fighterIds.length) {
    errors.push("Deployment contains duplicate fighter IDs.");
  }

  for (const fighterId of deployment.fighterIds) {
    if (!team.roster.includes(fighterId)) {
      errors.push(
        `Fighter "${fighterId}" does not belong to team "${team.id}".`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}