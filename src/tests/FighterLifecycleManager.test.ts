import { describe, expect, it } from "vitest";
import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";
import { FighterLifecycleManager } from "../systems/FighterLifecycleManager";

function createFighter(
  id = "iron-man",
  teamId: string | null = "team-a",
  isAlive = true,
  isDeployed = true
): FighterState {
  return {
    id,
    name: "Iron Man",
    teamId,
    isAlive,
    isDeployed,
    fatigue: 0
  };
}

function createTeam(
  id = "team-a",
  roster: string[] = ["iron-man"]
): TeamState {
  return {
    id,
    name: "Team A",
    budget: 220,
    roster,
    eliminatedFighters: []
  };
}

describe("FighterLifecycleManager", () => {
  it("eliminates a living fighter successfully", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter();
    const team = createTeam();

    const result = manager.eliminateFighter(fighter, team);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("marks the fighter as dead", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter();
    const team = createTeam();

    manager.eliminateFighter(fighter, team);

    expect(fighter.isAlive).toBe(false);
  });

  it("removes an eliminated fighter from the active roster", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter();
    const team = createTeam("team-a", ["iron-man", "thor"]);

    manager.eliminateFighter(fighter, team);

    expect(team.roster).toEqual(["thor"]);
  });

  it("adds the eliminated fighter to eliminatedFighters", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter();
    const team = createTeam();

    manager.eliminateFighter(fighter, team);

    expect(team.eliminatedFighters).toEqual(["iron-man"]);
  });

  it("clears deployment when a fighter is eliminated", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter();
    const team = createTeam();

    manager.eliminateFighter(fighter, team);

    expect(fighter.isDeployed).toBe(false);
  });

  it("rejects eliminating a fighter that is already dead", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter("iron-man", "team-a", false, false);
    const team = createTeam();

    const result = manager.eliminateFighter(fighter, team);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Fighter "iron-man" is already eliminated.'
    );
  });

  it("rejects a fighter that does not belong to the team", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter("iron-man", "team-b");
    const team = createTeam("team-a");

    const result = manager.eliminateFighter(fighter, team);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Fighter "iron-man" does not belong to team "team-a".'
    );
  });

  it("rejects an empty fighter ID", () => {
    const manager = new FighterLifecycleManager();
    const fighter = createFighter("   ");
    const team = createTeam();

    const result = manager.eliminateFighter(fighter, team);

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Fighter ID cannot be empty.");
  });
});