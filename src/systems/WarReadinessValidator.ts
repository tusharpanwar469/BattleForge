import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";

export interface WarReadinessResult {
  isReady: boolean;
  errors: string[];
}

export const WAR_MIN_LIVING_FIGHTERS = 8;

export function validateWarReadiness(
  teams: TeamState[],
  fighters: FighterState[]
): WarReadinessResult {
  const errors: string[] = [];

  for (const team of teams) {
    const livingFighterCount = fighters.filter(
      (fighter) =>
        fighter.teamId === team.id &&
        fighter.isAlive
    ).length;

    if (livingFighterCount < WAR_MIN_LIVING_FIGHTERS) {
      errors.push(
        `Team "${team.id}" has ${livingFighterCount} living fighters; at least ${WAR_MIN_LIVING_FIGHTERS} are required to begin the war.`
      );
    }
  }

  return {
    isReady: errors.length === 0,
    errors
  };
}