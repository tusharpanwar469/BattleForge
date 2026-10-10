import { describe, expect, it } from "vitest";
import type {
  BattleLabEventTrace,
  BattleLabResult,
  BattleLabScenario
} from "../core/BattleLab";

describe("BattleLab contracts", () => {
  it("supports a named calibration scenario with regression expectations", () => {
    const scenario: BattleLabScenario = {
      id: "baseline-scenario",
      name: "Baseline Scenario",
      description: "Neutral scenario for Battle Engine calibration.",
      expectedWinnerTeamId: "team-a",
      expectedEventTypes: ["CLASH", "ADVANTAGE", "VICTORY"]
    };

    expect(scenario.id).toBe("baseline-scenario");
    expect(scenario.name).toBe("Baseline Scenario");
    expect(scenario.expectedWinnerTeamId).toBe("team-a");
    expect(scenario.expectedEventTypes).toEqual([
      "CLASH",
      "ADVANTAGE",
      "VICTORY"
    ]);
  });

  it("supports an event trace entry", () => {
    const event: BattleLabEventTrace = {
      event: "ADVANTAGE",
      description: "Battle Engine reported an advantage event."
    };

    expect(event.event).toBe("ADVANTAGE");
    expect(event.description).toContain("advantage");
  });

  it("defines the complete lab result boundary", () => {
    const labResult: BattleLabResult = {
      scenarioId: "baseline-scenario",
      input: {
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
      },
      result: {
        winnerTeamId: "team-a",
        loserTeamId: "team-b",
        round: 1,
        reason: "team-a won the baseline scenario.",
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
      },
      eventTrace: [
        {
          event: "CLASH",
          description: "The two deployed teams engaged in battle."
        },
        {
          event: "ADVANTAGE",
          description: "team-a gained the advantage."
        },
        {
          event: "VICTORY",
          description: "team-a achieved victory over team-b."
        }
      ],
      explanation: "team-a won the baseline scenario.",
      validation: {
        isValid: true,
        notes: []
      }
    };

    expect(labResult.scenarioId).toBe("baseline-scenario");
    expect(labResult.result.winnerTeamId).toBe("team-a");
    expect(labResult.eventTrace).toHaveLength(3);
    expect(labResult.validation.isValid).toBe(true);
    expect(labResult.validation.notes).toEqual([]);
  });
});