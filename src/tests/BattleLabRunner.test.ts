import { describe, expect, it } from "vitest";
import type { BattleLabInputSnapshot, BattleLabScenario } from "../core/BattleLab";
import type { BattleResult } from "../core/BattleResult";
import type { BattleEngine } from "../systems/BattleEngine";
import { BattleLabRunner } from "../systems/BattleLabRunner";
import { FighterRegistry } from "../systems/FighterRegistry";

const scenario: BattleLabScenario = {
  id: "lab-001",
  name: "Basic Battle",
  description: "Basic Battle Lab scenario."
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


