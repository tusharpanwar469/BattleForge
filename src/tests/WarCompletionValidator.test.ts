import { describe, expect, it } from "vitest";
import type { TeamState } from "../core/TeamState";
import type { FighterState } from "../core/FighterState";
import { validateWarCompletion } from "../systems/WarCompletionValidator";

function createTeam(
  id: string,
  roster: string[] = ["fighter-1"]
): TeamState {
  return {
    id,
    name: id,
    budget: 220,
    roster,
    eliminatedFighters: []
  };
}

function createFighter(
  id: string,
  teamId: string | null,
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

function createFightersForTeams(
  teams: TeamState[]
): FighterState[] {
  return teams.flatMap((team) =>
    team.roster.map((id) => createFighter(id, team.id))
  );
}

describe("WarCompletionValidator", () => {
  it("reports the war as incomplete when multiple teams have living fighters", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ];

    const result = validateWarCompletion(
      teams,
      createFightersForTeams(teams)
    );

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toEqual([]);
  });

  it("reports the surviving team as the winner when only one team has living fighters", () => {
    const teams = [
      createTeam("team-a", ["fighter-1", "fighter-2"]),
      createTeam("team-b", []),
      createTeam("team-c", []),
      createTeam("team-d", [])
    ];

    const fighters = [
      createFighter("fighter-1", "team-a"),
      createFighter("fighter-2", "team-a")
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-a");
    expect(result.errors).toEqual([]);
  });

  it("does not declare a winner when no team has living fighters", () => {
    const teams = [
      createTeam("team-a", []),
      createTeam("team-b", [])
    ];

    const result = validateWarCompletion(teams, []);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      "War cannot be completed because no team has living fighters."
    );
  });

  it("rejects war completion checks with fewer than two teams", () => {
    const teams = [createTeam("team-a")];

    const result = validateWarCompletion(teams, []);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      "War completion requires at least 2 teams."
    );
  });

  it("rejects duplicate team IDs", () => {
    const teams = [
      createTeam("team-a"),
      createTeam("team-a")
    ];

    const result = validateWarCompletion(teams, []);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      'Duplicate team id: "team-a".'
    );
  });

  it("handles a two-team war with one surviving team", () => {
    const teams = [
      createTeam("team-a", []),
      createTeam("team-b", [])
    ];

    const fighters = [
      createFighter("fighter-1", "team-b")
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-b");
  });

  it("does not count dead fighters as living fighters", () => {
    const teams = [
      createTeam("team-a", ["fighter-a"]),
      createTeam("team-b", ["fighter-b"])
    ];

    const fighters = [
      createFighter("fighter-a", "team-a", false),
      createFighter("fighter-b", "team-b", true)
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-b");
  });

  it("does not count a nonempty roster when all its fighters are dead", () => {
    const teams = [
      createTeam("team-a", ["fighter-a"]),
      createTeam("team-b", [])
    ];

    const fighters = [
      createFighter("fighter-a", "team-a", false)
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      "War cannot be completed because no team has living fighters."
    );
  });

  it("counts living fighters even when their team's roster is empty", () => {
    const teams = [
      createTeam("team-a", []),
      createTeam("team-b", [])
    ];

    const fighters = [
      createFighter("fighter-b", "team-b")
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-b");
    expect(result.errors).toEqual([]);
  });

  it("ignores living fighters that do not belong to a supplied team", () => {
    const teams = [
      createTeam("team-a", []),
      createTeam("team-b", [])
    ];

    const fighters = [
      createFighter("external-fighter", "team-x"),
      createFighter("unassigned-fighter", null)
    ];

    const result = validateWarCompletion(teams, fighters);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
  });
});
