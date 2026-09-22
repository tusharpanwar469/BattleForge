import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { TeamState } from "../core/TeamState";
import { FighterRegistry } from "../systems/FighterRegistry";
import { BattleDeploymentManager } from "../systems/BattleDeploymentManager";

const createFighter = (id: string): FighterDefinition => ({
  id,
  name: id,
  factors: {
    power: 1,
    durability: 1,
    speed: 1,
    intelligence: 1,
    combatSkill: 1,
    abilities: 1,
    equipment: 1,
    battlefield: 1,
    endurance: 1,
    teamwork: 1,
    magic: 1,
    technology: 1
  },
  peakScreenState: "peak",
  sources: ["test"],
  feats: ["test"]
});

const createTeam = (): TeamState => ({
  id: "team-a",
  name: "Team A",
  budget: 220,
  roster: [
    "fighter-1",
    "fighter-2",
    "fighter-3",
    "fighter-4",
    "fighter-5",
    "fighter-6",
    "fighter-7",
    "fighter-8"
  ],
  eliminatedFighters: []
});

const createRegistry = (): FighterRegistry => {
  const registry = new FighterRegistry();

  for (let index = 1; index <= 8; index += 1) {
    registry.register(createFighter(`fighter-${index}`));
  }

  return registry;
};

describe("BattleDeploymentManager", () => {
  it("creates a valid deployment for a team", () => {
    const manager = new BattleDeploymentManager(createRegistry());
    const team = createTeam();

    const result = manager.createDeployment(team, [
      "fighter-1",
      "fighter-2"
    ]);

    expect(result.success).toBe(true);
    expect(result.deployment).toEqual({
      teamId: "team-a",
      fighterIds: ["fighter-1", "fighter-2"]
    });
  });

  it("rejects an invalid deployment", () => {
    const manager = new BattleDeploymentManager(createRegistry());
    const team = createTeam();

    const result = manager.createDeployment(team, [
      "fighter-1",
      "unknown-fighter"
    ]);

    expect(result.success).toBe(false);
    expect(result.deployment).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("updates an existing deployment", () => {
    const manager = new BattleDeploymentManager(createRegistry());
    const team = createTeam();

    const created = manager.createDeployment(team, [
      "fighter-1",
      "fighter-2"
    ]);

    expect(created.success).toBe(true);

    const updated = manager.updateDeployment(team, {
      teamId: "team-a",
      fighterIds: ["fighter-3", "fighter-4"]
    });

    expect(updated.success).toBe(true);
    expect(updated.deployment).toEqual({
      teamId: "team-a",
      fighterIds: ["fighter-3", "fighter-4"]
    });
  });

  it("rejects an update with too many fighters", () => {
    const manager = new BattleDeploymentManager(createRegistry());
    const team = createTeam();

    const result = manager.updateDeployment(team, {
      teamId: "team-a",
      fighterIds: [
        "fighter-1",
        "fighter-2",
        "fighter-3",
        "fighter-4",
        "fighter-5"
      ]
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects an update for the wrong team", () => {
    const manager = new BattleDeploymentManager(createRegistry());
    const team = createTeam();

    const result = manager.updateDeployment(team, {
      teamId: "team-b",
      fighterIds: ["fighter-1"]
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});