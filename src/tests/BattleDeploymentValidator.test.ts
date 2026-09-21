import { describe, expect, it } from "vitest";
import type { BattleDeployment } from "../core/BattleDeployment";
import type { TeamState } from "../core/TeamState";
import {
  MAX_DEPLOYED_FIGHTERS,
  MIN_DEPLOYED_FIGHTERS,
  validateBattleDeployment
} from "../systems/BattleDeploymentValidator";

describe("BattleDeploymentValidator", () => {
  const team: TeamState = {
    id: "team-a",
    name: "Team A",
    budget: 220,
    roster: ["iron-man", "thor", "hulk", "captain-america"],
    eliminatedFighters: []
  };

  it("accepts a valid deployment", () => {
    const deployment: BattleDeployment = {
      teamId: "team-a",
      fighterIds: ["iron-man", "thor"]
    };

    const result = validateBattleDeployment(deployment, team);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a deployment for the wrong team", () => {
    const deployment: BattleDeployment = {
      teamId: "team-b",
      fighterIds: ["iron-man"]
    };

    const result = validateBattleDeployment(deployment, team);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects deployment below the minimum", () => {
    const deployment: BattleDeployment = {
      teamId: "team-a",
      fighterIds: []
    };

    const result = validateBattleDeployment(deployment, team);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects deployment above the maximum", () => {
    const deployment: BattleDeployment = {
      teamId: "team-a",
      fighterIds: [
        "iron-man",
        "thor",
        "hulk",
        "captain-america",
        "fighter-5"
      ]
    };

    const result = validateBattleDeployment(deployment, team);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("uses the expected deployment limits", () => {
    expect(MIN_DEPLOYED_FIGHTERS).toBe(1);
    expect(MAX_DEPLOYED_FIGHTERS).toBe(4);
  });
});