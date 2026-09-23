import { describe, expect, it } from "vitest";
import type { BattleResult } from "../core/BattleResult";
import type { FighterState } from "../core/FighterState";
import type { TeamState } from "../core/TeamState";
import { BattleConsequenceManager } from "../systems/BattleConsequenceManager";

function createFighter(
  id: string,
  teamId: string | null = "team-a",
  isAlive = true,
  isDeployed = true
): FighterState {
  return {
    id,
    name: id,
    teamId,
    isAlive,
    isDeployed,
    fatigue: 0
  };
}

function createTeam(
  id: string,
  roster: string[]
): TeamState {
  return {
    id,
    name: id === "team-a" ? "Team A" : "Team B",
    budget: 220,
    roster,
    eliminatedFighters: []
  };
}

function createBattleResult(
  winnerTeamId = "team-a",
  loserTeamId = "team-b"
): BattleResult {
  return {
    winnerTeamId,
    loserTeamId,
    round: 1,
    reason: "Team A won the battle.",
    factors: {
      power: 10,
      durability: 10,
      speed: 10,
      intelligence: 10,
      combatSkill: 10,
      abilities: 10,
      equipment: 10,
      battlefield: 10,
      endurance: 10,
      teamwork: 10,
      magic: 10,
      technology: 10
    },
    events: []
  };
}

describe("BattleConsequenceManager", () => {
  it("eliminates all living fighters from the losing team", () => {
    const manager = new BattleConsequenceManager();

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b", "fighter-c"]);

    const fighterA = createFighter("fighter-a", "team-a");
    const fighterB = createFighter("fighter-b", "team-b");
    const fighterC = createFighter("fighter-c", "team-b");

    const result = manager.applyBattleResult(
      createBattleResult(),
      teamA,
      teamB,
      [fighterA, fighterB, fighterC]
    );

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);

    expect(fighterB.isAlive).toBe(false);
    expect(fighterC.isAlive).toBe(false);

    expect(teamB.roster).toEqual([]);
    expect(teamB.eliminatedFighters).toEqual([
      "fighter-b",
      "fighter-c"
    ]);
  });

  it("does not eliminate fighters from the winning team", () => {
    const manager = new BattleConsequenceManager();

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);

    const fighterA = createFighter("fighter-a", "team-a");
    const fighterB = createFighter("fighter-b", "team-b");

    const result = manager.applyBattleResult(
      createBattleResult(),
      teamA,
      teamB,
      [fighterA, fighterB]
    );

    expect(result.success).toBe(true);

    expect(fighterA.isAlive).toBe(true);
    expect(fighterA.isDeployed).toBe(true);
    expect(teamA.roster).toEqual(["fighter-a"]);
    expect(teamA.eliminatedFighters).toEqual([]);
  });

  it("rejects a battle result whose winner is not part of the battle", () => {
    const manager = new BattleConsequenceManager();

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);

    const result = manager.applyBattleResult(
      createBattleResult("team-c", "team-b"),
      teamA,
      teamB,
      [
        createFighter("fighter-a", "team-a"),
        createFighter("fighter-b", "team-b")
      ]
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a battle result whose loser is not part of the battle", () => {
    const manager = new BattleConsequenceManager();

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);

    const result = manager.applyBattleResult(
      createBattleResult("team-a", "team-c"),
      teamA,
      teamB,
      [
        createFighter("fighter-a", "team-a"),
        createFighter("fighter-b", "team-b")
      ]
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a battle result with the same winner and loser", () => {
    const manager = new BattleConsequenceManager();

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);

    const result = manager.applyBattleResult(
      createBattleResult("team-a", "team-a"),
      teamA,
      teamB,
      [
        createFighter("fighter-a", "team-a"),
        createFighter("fighter-b", "team-b")
      ]
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Battle result cannot have the same winner and loser team."
    );
  });
});


