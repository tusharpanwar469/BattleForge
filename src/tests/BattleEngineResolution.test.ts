import { describe, expect, it } from "vitest";
import type { BattleFactors } from "../core/BattleFactors";
import type { BattleDeployment } from "../core/BattleDeployment";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import { BattleEngine } from "../systems/BattleEngine";
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

function createFighter(
  id: string,
  name: string,
  factorValue: number
): FighterDefinition {
  return {
    id,
    name,
    factors: createFactors(factorValue),
    peakScreenState: "Peak cinematic state",
    sources: ["Test source"],
    feats: ["Test feat"]
  };
}

function createTeam(
  id: string,
  roster: string[]
): TeamState {
  return {
    id,
    name: id,
    budget: 220,
    roster,
    eliminatedFighters: []
  };
}

function createGameState(round: number): GameState {
  return {
    phase: "battle",
    round,
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

describe("BattleEngine resolution", () => {
  it("resolves the team with the higher combined deployed score as the winner", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    const teamA = createTeam("team-a", ["iron-man"]);
    const teamB = createTeam("team-b", ["captain-america"]);

    const deploymentA = createDeployment("team-a", ["iron-man"]);
    const deploymentB = createDeployment("team-b", ["captain-america"]);

    const result = engine.resolveBattle(
      createGameState(3),
      teamA,
      deploymentA,
      teamB,
      deploymentB,
      registry
    );

    expect(result.winnerTeamId).toBe("team-a");
    expect(result.loserTeamId).toBe("team-b");
    expect(result.events).toHaveLength(3);

expect(result.events.map((event) => event.type)).toEqual([
  "CLASH",
  "ADVANTAGE",
  "VICTORY"
]);

expect(
  result.events.every((event) => event.round === 3)
).toBe(true);

expect(result.events[1].description).toContain("team-a");
expect(result.events[1].description).toContain("team-b");

expect(result.events[2].description).toContain("team-a");
expect(result.events[2].description).toContain("team-b");
  });

  it("aggregates factors from all deployed fighters", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("thor", "Thor", 20));
    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    const teamA = createTeam("team-a", ["iron-man", "thor"]);
    const teamB = createTeam("team-b", ["captain-america"]);

    const deploymentA = createDeployment(
      "team-a",
      ["iron-man", "thor"]
    );

    const deploymentB = createDeployment(
      "team-b",
      ["captain-america"]
    );

    const result = engine.resolveBattle(
      createGameState(4),
      teamA,
      deploymentA,
      teamB,
      deploymentB,
      registry
    );

    expect(result.winnerTeamId).toBe("team-a");
    expect(result.factors).toEqual(createFactors(30));
  });

  it("preserves the current game round in the battle result", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    const result = engine.resolveBattle(
      createGameState(7),
      createTeam("team-a", ["iron-man"]),
      createDeployment("team-a", ["iron-man"]),
      createTeam("team-b", ["captain-america"]),
      createDeployment("team-b", ["captain-america"]),
      registry
    );

    expect(result.round).toBe(7);
  });

  it("resolves deployed fighters through the fighter registry", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    const result = engine.resolveBattle(
      createGameState(1),
      createTeam("team-a", ["iron-man"]),
      createDeployment("team-a", ["iron-man"]),
      createTeam("team-b", ["captain-america"]),
      createDeployment("team-b", ["captain-america"]),
      registry
    );

    expect(result.winnerTeamId).toBe("team-a");
  });

  it("rejects a deployment containing an unregistered fighter", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    expect(() =>
      engine.resolveBattle(
        createGameState(1),
        createTeam("team-a", ["iron-man"]),
        createDeployment("team-a", ["iron-man"]),
        createTeam("team-b", ["captain-america"]),
        createDeployment("team-b", ["captain-america"]),
        registry
      )
    ).toThrow("Fighter \"iron-man\" is not registered.");
  });

  it("rejects an invalid deployment", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("captain-america", "Captain America", 5));

    const engine = new BattleEngine();

    expect(() =>
      engine.resolveBattle(
        createGameState(1),
        createTeam("team-a", ["iron-man"]),
        createDeployment("team-a", []),
        createTeam("team-b", ["captain-america"]),
        createDeployment("team-b", ["captain-america"]),
        registry
      )
    ).toThrow("Deployment must contain at least 1 fighter.");
  });

  it("rejects a tied battle score instead of inventing a winner", () => {
    const registry = new FighterRegistry();

    registry.register(createFighter("iron-man", "Iron Man", 10));
    registry.register(createFighter("captain-america", "Captain America", 10));

    const engine = new BattleEngine();

    expect(() =>
      engine.resolveBattle(
        createGameState(2),
        createTeam("team-a", ["iron-man"]),
        createDeployment("team-a", ["iron-man"]),
        createTeam("team-b", ["captain-america"]),
        createDeployment("team-b", ["captain-america"]),
        registry
      )
    ).toThrow("Battle cannot be resolved because the deployment scores are tied.");
  });
});