import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";

export interface WarCompletionResult {
  isComplete: boolean;
  winnerTeamId: string | null;
  errors: string[];
}

export function validateWarCompletion(
  teams: TeamState[],
  fighters: FighterState[]
): WarCompletionResult {
  const errors: string[] = [];

  if (teams.length < 2) {
    errors.push("War completion requires at least 2 teams.");
    return {
      isComplete: false,
      winnerTeamId: null,
      errors
    };
  }

  const teamIds = new Set<string>();

  for (const team of teams) {
    if (teamIds.has(team.id)) {
      errors.push(`Duplicate team id: "${team.id}".`);
    }

    teamIds.add(team.id);
  }

  if (errors.length > 0) {
    return {
      isComplete: false,
      winnerTeamId: null,
      errors
    };
  }

  const livingTeamIds = new Set(
    fighters
      .filter(
        (fighter) =>
          fighter.isAlive &&
          fighter.teamId !== null &&
          teamIds.has(fighter.teamId)
      )
      .map((fighter) => fighter.teamId as string)
  );

  const livingTeams = teams.filter((team) =>
    livingTeamIds.has(team.id)
  );

  if (livingTeams.length === 0) {
    errors.push(
      "War cannot be completed because no team has living fighters."
    );

    return {
      isComplete: false,
      winnerTeamId: null,
      errors
    };
  }

  if (livingTeams.length === 1) {
    return {
      isComplete: true,
      winnerTeamId: livingTeams[0].id,
      errors: []
    };
  }

  return {
    isComplete: false,
    winnerTeamId: null,
    errors: []
  };
}