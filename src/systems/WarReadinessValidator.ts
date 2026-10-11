import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";

export interface WarReadinessResult {
  isReady: boolean;
  errors: string[];
}

export const WAR_MIN_LIVING_FIGHTERS = 8;

export function validateWarReadiness(
  teams: TeamState[],
  fighters: FighterState[],
): WarReadinessResult {
  const errors: string[] = [];
  if (teams.length < 2) {
    errors.push("War readiness requires at least 2 teams.");
  }

  const teamIds = new Set<string>();

  for (const team of teams) {
    if (!team.id.trim()) {
      errors.push("Team ID cannot be empty.");
    } else if (teamIds.has(team.id)) {
      errors.push(`Duplicate team id: "${team.id}".`);
    }

    teamIds.add(team.id);
  }

  if (errors.length > 0) {
    return {
      isReady: false,
      errors,
    };
  }

  for (const team of teams) {
    const livingFighterCount = fighters.filter(
      (fighter) => fighter.teamId === team.id && fighter.isAlive,
    ).length;

    if (livingFighterCount < WAR_MIN_LIVING_FIGHTERS) {
      errors.push(
        `Team "${team.id}" has ${livingFighterCount} living fighters; at least ${WAR_MIN_LIVING_FIGHTERS} are required to begin the war.`,
      );
    }
  }

  return {
    isReady: errors.length === 0,
    errors,
  };
}
