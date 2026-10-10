import { describe, expect, it } from "vitest";
import type {
  BattleLabInputSnapshot,
  BattleLabScenario
} from "../core/BattleLab";
import type { BattleResult } from "../core/BattleResult";
import  { BattleEngine } from "../systems/BattleEngine";
import { BattleLabRunner } from "../systems/BattleLabRunner";
import { FighterRegistry } from "../systems/FighterRegistry";

const scenario: BattleLabScenario = {
  id: "lab-001",
  name: "Basic Battle",
  description: "Basic Battle Lab scenario.",
  expectedWinnerTeamId: "team-a",
  expectedEventTypes: ["CLASH", "ADVANTAGE", "VICTORY"]
};

const input: BattleLabInputSnapshot = {
  gameState: {
    phase: "battle",
    round: 1,
    isPaused: false
  },
  teamA: {
    id: "team-a",
    name: "Team A",
    budget: 220,
    roster: ["fighter-a"],
    eliminatedFighters: []
  },
  teamB: {
    id: "team-b",
    name: "Team B",
    budget: 220,
    roster: ["fighter-b"],
    eliminatedFighters: []
  },
  deploymentA: {
    teamId: "team-a",
    fighterIds: ["fighter-a"]
  },
  deploymentB: {
    teamId: "team-b",
    fighterIds: ["fighter-b"]
  }
};

const battleResult: BattleResult = {
  winnerTeamId: "team-a",
  loserTeamId: "team-b",
  round: 1,
  reason: "Team A won the test battle.",
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
  events: [
    {
      type: "CLASH",
      round: 1,
      description: "The two deployed teams engaged in battle."
    },
    {
      type: "ADVANTAGE",
      round: 1,
      description: "team-a gained the advantage."
    },
    {
      type: "VICTORY",
      round: 1,
      description: "team-a achieved victory over team-b."
    }
  ]
};

function createRunner(): BattleLabRunner {
  const engine = {
    resolveBattle: () => battleResult
  } as unknown as BattleEngine;

  return new BattleLabRunner(engine, new FighterRegistry());
}

describe("BattleLabRunner", () => {
  it("runs a valid scenario and returns the Battle Lab result", () => {
    const runner = createRunner();

    const result = runner.runScenario(scenario, input);

    expect(result.scenarioId).toBe("lab-001");
    expect(result.result).toEqual(battleResult);
    expect(result.validation.isValid).toBe(true);
    expect(result.eventTrace).toHaveLength(3);
  });
  it("reports a result whose winner and loser are not participating teams", () => {
  const runner = new BattleLabRunner(
    {
      resolveBattle: () => ({
        ...battleResult,
        winnerTeamId: "team-x",
        loserTeamId: "team-b"
      })
    } as unknown as BattleEngine,
    new FighterRegistry()
  );

  const result = runner.runScenario(scenario, input);

  expect(result.validation.isValid).toBe(false);
  expect(result.validation.notes).toContain(
    "Battle result winner and loser must be different participating teams."
  );
});

it("reports an event with an empty description", () => {
  const runner = new BattleLabRunner(
    {
      resolveBattle: () => ({
        ...battleResult,
        events: [
          {
            type: "CLASH",
            round: 1,
            description: ""
          },
          ...battleResult.events.slice(1)
        ]
      })
    } as unknown as BattleEngine,
    new FighterRegistry()
  );

  const result = runner.runScenario(scenario, input);

  expect(result.validation.isValid).toBe(false);
  expect(result.validation.notes).toContain(
    'Battle event "CLASH" must have a non-empty description.'
  );
});
  it("propagates an unregistered fighter error from the real Battle Engine", () => {
  const registry = new FighterRegistry();

  registry.register({
    id: "fighter-a",
    name: "Fighter A",
    factors: battleResult.factors,
    peakScreenState: "Peak cinematic state",
    sources: ["Registry regression test source"],
    feats: ["Registry regression test feat"]
  });

  const runner = new BattleLabRunner(
    new BattleEngine(),
    registry
  );

  expect(() => runner.runScenario(scenario, input)).toThrow(
    'Fighter "fighter-b" is not registered.'
  );
});
  it("propagates the real Battle Engine's tied-score error", () => {
  const registry = new FighterRegistry();

  registry.register({
    id: "fighter-a",
    name: "Fighter A",
    factors: battleResult.factors,
    peakScreenState: "Peak cinematic state",
    sources: ["Tie regression test source"],
    feats: ["Tie regression test feat"]
  });

  registry.register({
    id: "fighter-b",
    name: "Fighter B",
    factors: battleResult.factors,
    peakScreenState: "Peak cinematic state",
    sources: ["Tie regression test source"],
    feats: ["Tie regression test feat"]
  });

  const runner = new BattleLabRunner(
    new BattleEngine(),
    registry
  );

  expect(() => runner.runScenario(scenario, input)).toThrow(
    "Battle cannot be resolved because the deployment scores are tied."
  );
});
  it("integrates the real Battle Engine with the registry and validates its result", () => {
  const registry = new FighterRegistry();

  const createFactors = (value: number) => ({
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
  });

  registry.register({
    id: "fighter-a",
    name: "Fighter A",
    factors: createFactors(10),
    peakScreenState: "Peak cinematic state",
    sources: ["Integration test source"],
    feats: ["Integration test feat"]
  });

  registry.register({
    id: "fighter-b",
    name: "Fighter B",
    factors: createFactors(5),
    peakScreenState: "Peak cinematic state",
    sources: ["Integration test source"],
    feats: ["Integration test feat"]
  });

  const runner = new BattleLabRunner(
    new BattleEngine(),
    registry
  );

  const result = runner.runScenario(scenario, input);

  expect(result.scenarioId).toBe("lab-001");
  expect(result.result.winnerTeamId).toBe("team-a");
  expect(result.result.loserTeamId).toBe("team-b");
  expect(result.result.round).toBe(input.gameState.round);

  expect(result.result.events.map((event) => event.type)).toEqual([
    "CLASH",
    "ADVANTAGE",
    "VICTORY"
  ]);

  expect(result.eventTrace.map((event) => event.event)).toEqual([
    "CLASH",
    "ADVANTAGE",
    "VICTORY"
  ]);

  expect(result.validation.isValid).toBe(true);
  expect(result.validation.notes).toEqual([]);
  expect(result.explanation).toBe(result.result.reason);
});
  it("reports an unexpected winner", () => {
    const runner = new BattleLabRunner(
      {
        resolveBattle: () => ({
          ...battleResult,
          winnerTeamId: "team-b",
          loserTeamId: "team-a"
        })
      } as unknown as BattleEngine,
      new FighterRegistry()
    );

    const result = runner.runScenario(scenario, input);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.notes).toContain(
      'Expected winner "team-a", but Battle Engine reported "team-b".'
    );
  });

  it("reports an unexpected event sequence", () => {
    const runner = new BattleLabRunner(
      {
        resolveBattle: () => ({
          ...battleResult,
          events: [
            {
              type: "CLASH",
              round: 1,
              description: "The two deployed teams engaged in battle."
            },
            {
              type: "COUNTER",
              round: 1,
              description: "A counter event occurred."
            },
            {
              type: "VICTORY",
              round: 1,
              description: "team-a achieved victory over team-b."
            }
          ]
        })
      } as unknown as BattleEngine,
      new FighterRegistry()
    );

    const result = runner.runScenario(scenario, input);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.notes).toContain(
      "Expected event sequence [CLASH, ADVANTAGE, VICTORY], but Battle Engine reported [CLASH, COUNTER, VICTORY]."
    );
  });

  it("records the authoritative Battle Engine events", () => {
    const runner = createRunner();

    const result = runner.runScenario(scenario, input);

    expect(result.eventTrace.map((event) => event.event)).toEqual([
      "CLASH",
      "ADVANTAGE",
      "VICTORY"
    ]);

    expect(result.eventTrace[0].description).toBe(
      battleResult.events[0].description
    );

    expect(result.eventTrace[1].description).toBe(
      battleResult.events[1].description
    );

    expect(result.eventTrace[2].description).toBe(
      battleResult.events[2].description
    );

    expect(result.explanation).toBe(battleResult.reason);
  });

  it("validates battle result and event rounds", () => {
    const runner = createRunner();

    const result = runner.runScenario(scenario, input);

    expect(result.validation.isValid).toBe(true);
    expect(result.validation.notes).toEqual([]);
  });

  it("reports a battle round mismatch", () => {
    const runner = new BattleLabRunner(
      {
        resolveBattle: () => ({
          ...battleResult,
          round: 2
        })
      } as unknown as BattleEngine,
      new FighterRegistry()
    );

    const result = runner.runScenario(scenario, input);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.notes).toContain(
      "Battle result round 2 does not match game state round 1."
    );
  });

  it("reports a battle event round mismatch", () => {
    const runner = new BattleLabRunner(
      {
        resolveBattle: () => ({
          ...battleResult,
          events: [
            {
              type: "CLASH",
              round: 2,
              description: "The two deployed teams engaged in battle."
            },
            {
              type: "ADVANTAGE",
              round: 1,
              description: "team-a gained the advantage."
            },
            {
              type: "VICTORY",
              round: 1,
              description: "team-a achieved victory over team-b."
            }
          ]
        })
      } as unknown as BattleEngine,
      new FighterRegistry()
    );

    const result = runner.runScenario(scenario, input);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.notes).toContain(
      'Battle event "CLASH" has round 2, but battle result round is 1.'
    );
  });

  it("rejects an invalid deployment", () => {
    const runner = createRunner();

    const invalidInput: BattleLabInputSnapshot = {
      ...input,
      deploymentA: {
        teamId: "team-a",
        fighterIds: ["unknown-fighter"]
      }
    };

    expect(() => runner.runScenario(scenario, invalidInput)).toThrow(
      'Battle Lab scenario "lab-001" is invalid'
    );
  });
});