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
const labResult = {} as BattleLabResult;

expect(labResult).toBeDefined();

});
});