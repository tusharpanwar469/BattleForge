import { describe, expect, it } from "vitest";
import type { TeamState } from "../core/TeamState";
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

describe("WarCompletionValidator", () => {
  it("reports the war as incomplete when multiple teams have living fighters", () => {
    const result = validateWarCompletion([
      createTeam("team-a"),
      createTeam("team-b"),
      createTeam("team-c"),
      createTeam("team-d")
    ]);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toEqual([]);
  });

  it("reports the surviving team as the winner when only one team has living fighters", () => {
    const result = validateWarCompletion([
      createTeam("team-a", ["fighter-1", "fighter-2"]),
      createTeam("team-b", []),
      createTeam("team-c", []),
      createTeam("team-d", [])
    ]);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-a");
    expect(result.errors).toEqual([]);
  });

  it("does not declare a winner when no team has living fighters", () => {
    const result = validateWarCompletion([
      createTeam("team-a", []),
      createTeam("team-b", [])
    ]);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      "War cannot be completed because no team has living fighters."
    );
  });

  it("rejects war completion checks with fewer than two teams", () => {
    const result = validateWarCompletion([
      createTeam("team-a")
    ]);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      "War completion requires at least 2 teams."
    );
  });

  it("rejects duplicate team IDs", () => {
    const result = validateWarCompletion([
      createTeam("team-a"),
      createTeam("team-a")
    ]);

    expect(result.isComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
    expect(result.errors).toContain(
      'Duplicate team id: "team-a".'
    );
  });

  it("handles a two-team war with one surviving team", () => {
    const result = validateWarCompletion([
      createTeam("team-a", []),
      createTeam("team-b", ["fighter-1"])
    ]);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-b");
  });

  it("does not treat eliminated fighters as living fighters", () => {
    const result = validateWarCompletion([
      createTeam("team-a", []),
      createTeam("team-b", ["fighter-1"])
    ]);

    expect(result.isComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-b");
  });
});