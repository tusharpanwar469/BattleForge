import { describe, expect, it } from "vitest";
import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";
import {
  validateWarReadiness,
  WAR_MIN_LIVING_FIGHTERS
} from "../systems/WarReadinessValidator";

function createTeam(id: string): TeamState {
  return {
    id,
    name: id,
    budget: 220,
    roster: [],
    eliminatedFighters: []
  };
}

function createFighter(
  id: string,
  teamId: string,
  isAlive = true
): FighterState {
  return {
    id,
    name: id,
    teamId,
    isAlive,
    isDeployed: false,
    fatigue: 0
  };
}

function createTeamFighters(
  teamId: string,
  count: number,
  startingIndex = 0
): FighterState[] {
  return Array.from({ length: count }, (_, index) =>
    createFighter(
      `${teamId}-fighter-${startingIndex + index}`,
      teamId
    )
  );
}

describe("WarReadinessValidator", () => {
  it("allows the war when every team has at least 8 living fighters", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const fighters = teams.flatMap((team) =>
      createTeamFighters(team.id, WAR_MIN_LIVING_FIGHTERS)
    );

    const result = validateWarReadiness(teams, fighters);

    expect(result.isReady).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects the war when one team has fewer than 8 living fighters", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const fighters = [
      ...createTeamFighters("team-a", 8),
      ...createTeamFighters("team-b", 8),
      ...createTeamFighters("team-c", 7),
      ...createTeamFighters("team-d", 8)
    ];

    const result = validateWarReadiness(teams, fighters);

    expect(result.isReady).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Team "team-c"');
  });

  it("counts only living fighters", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const fighters = [
      ...createTeamFighters("team-a", 8),
      ...createTeamFighters("team-b", 8),
      ...createTeamFighters("team-c", 8),
      ...createTeamFighters("team-d", 7),
      createFighter("team-d-dead", "team-d", false)
    ];

    const result = validateWarReadiness(teams, fighters);

    expect(result.isReady).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Team "team-d"');
  });

  it("reports every team that fails the minimum requirement", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const fighters = [
      ...createTeamFighters("team-a", 7),
      ...createTeamFighters("team-b", 6),
      ...createTeamFighters("team-c", 8),
      ...createTeamFighters("team-d", 5)
    ];

    const result = validateWarReadiness(teams, fighters);

    expect(result.isReady).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it("uses exactly 8 living fighters as the minimum", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const fighters = [
      ...createTeamFighters("team-a", 8),
      ...createTeamFighters("team-b", 9),
      ...createTeamFighters("team-c", 10),
      ...createTeamFighters("team-d", 16)
    ];

    const result = validateWarReadiness(teams, fighters);

    expect(result.isReady).toBe(true);
    expect(result.errors).toEqual([]);
  });
});