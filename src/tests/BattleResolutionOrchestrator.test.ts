import { describe, expect, it } from "vitest";
import type { BattleFactors } from "../core/BattleFactors";
import type { BattleDeployment } from "../core/BattleDeployment";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { FighterState } from "../core/FighterState";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import { BattleConsequenceManager } from "../systems/BattleConsequenceManager";
import { BattleEngine } from "../systems/BattleEngine";
import { BattleResolutionOrchestrator } from "../systems/BattleResolutionOrchestrator";
import { FighterRegistry } from "../systems/FighterRegistry";

function createFactors(value: number): BattleFactors {
  return {
    power: value,
    durability: value,
    speed: value,
    intelligence: value,
    combatSkill: value,
    abilities: value,
    equipment: value,
    battlefield: value,
    endurance: value,
    teamwork: value,
    magic: value,
    technology: value
  };
}

function createDefinition(
  id: string,
  value: number
): FighterDefinition {
  return {
    id,
    name: id,
    factors: createFactors(value),
    peakScreenState: "Peak cinematic state",
    sources: ["Test source"],
    feats: ["Test feat"]
  };
}

function createFighter(
  id: string,
  teamId: string
): FighterState {
  return {
    id,
    name: id,
    teamId,
    isAlive: true,
    isDeployed: true,
    fatigue: 0
  };
}

function createTeam(
  id: string,
  roster: string[] = []
): TeamState {
  return {
    id,
    name: id,
    budget: 220,
    roster,
    eliminatedFighters: []
  };
}

function createGameState(): GameState {
  return {
    phase: "battle",
    round: 1,
    isPaused: false
  };
}

function createDeployment(
  teamId: string,
  fighterIds: string[]
): BattleDeployment {
  return {
    teamId,
    fighterIds
  };
}

function createOrchestrator(): BattleResolutionOrchestrator {
  return new BattleResolutionOrchestrator(
    new BattleEngine(),
    new BattleConsequenceManager()
  );
}

describe("BattleResolutionOrchestrator", () => {
  it("resolves the battle and applies its consequences", () => {
    const registry = new FighterRegistry();

    registry.register(createDefinition("fighter-a", 10));
    registry.register(createDefinition("fighter-b", 5));

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);
    const teamC = createTeam("team-c");
    const teamD = createTeam("team-d");

    const fighterA = createFighter("fighter-a", "team-a");
    const fighterB = createFighter("fighter-b", "team-b");

    const orchestrator = createOrchestrator();

    const result = orchestrator.resolveBattle(
      createGameState(),
      teamA,
      createDeployment("team-a", ["fighter-a"]),
      teamB,
      createDeployment("team-b", ["fighter-b"]),
      [fighterA, fighterB],
      registry,
      [teamA, teamB, teamC, teamD]
    );

    expect(result.battleResult.winnerTeamId).toBe("team-a");
    expect(result.battleResult.loserTeamId).toBe("team-b");

    expect(fighterA.isAlive).toBe(true);
    expect(fighterB.isAlive).toBe(false);

    expect(teamA.roster).toEqual(["fighter-a"]);
    expect(teamB.roster).toEqual([]);

    expect(result.warComplete).toBe(true);
    expect(result.winnerTeamId).toBe("team-a");
  });

  it("does not declare the war complete while other teams still have fighters", () => {
    const registry = new FighterRegistry();

    registry.register(createDefinition("fighter-a", 20));
    registry.register(createDefinition("fighter-b", 5));

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);
    const teamC = createTeam("team-c", ["fighter-c"]);
    const teamD = createTeam("team-d", ["fighter-d"]);

    const fighterA = createFighter("fighter-a", "team-a");
    const fighterB = createFighter("fighter-b", "team-b");
    const fighterC = createFighter("fighter-c", "team-c");
    const fighterD = createFighter("fighter-d", "team-d");

    const orchestrator = createOrchestrator();

    const result = orchestrator.resolveBattle(
      createGameState(),
      teamA,
      createDeployment("team-a", ["fighter-a"]),
      teamB,
      createDeployment("team-b", ["fighter-b"]),
      [fighterA, fighterB, fighterC, fighterD],
      registry,
      [teamA, teamB, teamC, teamD]
    );

    expect(result.battleResult.winnerTeamId).toBe("team-a");

    expect(fighterB.isAlive).toBe(false);
    expect(fighterC.isAlive).toBe(true);
    expect(fighterD.isAlive).toBe(true);

    expect(result.warComplete).toBe(false);
    expect(result.winnerTeamId).toBeNull();
  });

  it("propagates an invalid deployment error", () => {
    const registry = new FighterRegistry();

    registry.register(createDefinition("fighter-a", 10));
    registry.register(createDefinition("fighter-b", 5));

    const teamA = createTeam("team-a", ["fighter-a"]);
    const teamB = createTeam("team-b", ["fighter-b"]);
    const teamC = createTeam("team-c");
    const teamD = createTeam("team-d");

    const orchestrator = createOrchestrator();

    expect(() =>
      orchestrator.resolveBattle(
        createGameState(),
        teamA,
        createDeployment("team-a", []),
        teamB,
        createDeployment("team-b", ["fighter-b"]),
        [
          createFighter("fighter-a", "team-a"),
          createFighter("fighter-b", "team-b")
        ],
        registry,
        [teamA, teamB, teamC, teamD]
      )
    ).toThrow("Deployment must contain at least 1 fighter.");
  });
});