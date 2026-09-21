import type { TeamState } from "../core/TeamState";
import type { FighterRegistry } from "./FighterRegistry";

export interface TeamRosterValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateTeamRoster(
  team: TeamState,
  registry: FighterRegistry
): TeamRosterValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  if (team.roster.length < 8) {
    errors.push("Team roster must contain at least 8 fighters.");
  }

  if (team.roster.length > 16) {
    errors.push("Team roster cannot contain more than 16 fighters.");
  }

  for (const fighterId of team.roster) {
    const normalizedId = fighterId.trim().toLowerCase();

    if (seenIds.has(normalizedId)) {
      errors.push(`Team roster contains duplicate fighter id: "${fighterId}".`);
      continue;
    }

    seenIds.add(normalizedId);

    if (!registry.has(fighterId)) {
      errors.push(`Fighter "${fighterId}" is not registered.`);
    }

    if (team.eliminatedFighters.includes(fighterId)) {
      errors.push(`Fighter "${fighterId}" is eliminated and cannot be in the active roster.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
