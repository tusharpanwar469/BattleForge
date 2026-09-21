import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { TeamState } from "../core/TeamState";
import { FighterRegistry } from "../systems/FighterRegistry";
import { validateTeamRoster } from "../systems/TeamRosterValidator";

const createFighter = (id: string): FighterDefinition => ({
  id,
  name: id,
  factors: {
    power: 5,
    durability: 5,
    speed: 5,
    intelligence: 5,
    combatSkill: 5,
    abilities: 5,
    equipment: 5,
    battlefield: 5,
    endurance: 5,
    teamwork: 5,
    magic: 5,
    technology: 5
  },
  peakScreenState: "test",
  sources: ["test"],
  feats: ["test"]
});

const createTeam = (roster: string[]): TeamState => ({
  id: "team-a",
  name: "Team A",
  budget: 220,
  roster,
  eliminatedFighters: []
});

describe("TeamRosterValidator", () => {
  it("accepts a valid roster", () => {
    const registry = new FighterRegistry();

    for (let i = 1; i <= 8; i++) {
      registry.register(createFighter(`fighter-${i}`));
    }

    const team = createTeam([
      "fighter-1",
      "fighter-2",
      "fighter-3",
      "fighter-4",
      "fighter-5",
      "fighter-6",
      "fighter-7",
      "fighter-8"
    ]);

    const result = validateTeamRoster(team, registry);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a roster with fewer than 8 fighters", () => {
    const registry = new FighterRegistry();

    for (let i = 1; i <= 7; i++) {
      registry.register(createFighter(`fighter-${i}`));
    }

    const team = createTeam([
      "fighter-1",
      "fighter-2",
      "fighter-3",
      "fighter-4",
      "fighter-5",
      "fighter-6",
      "fighter-7"
    ]);

    const result = validateTeamRoster(team, registry);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Team roster must contain at least 8 fighters."
    );
  });

  it("rejects duplicate fighter ids", () => {
    const registry = new FighterRegistry();

    for (let i = 1; i <= 8; i++) {
      registry.register(createFighter(`fighter-${i}`));
    }

    const team = createTeam([
      "fighter-1",
      "fighter-2",
      "fighter-3",
      "fighter-4",
      "fighter-5",
      "fighter-6",
      "fighter-7",
      "fighter-7"
    ]);

    const result = validateTeamRoster(team, registry);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Team roster contains duplicate fighter id: "fighter-7".'
    );
  });

  it("rejects an unregistered fighter", () => {
    const registry = new FighterRegistry();

    for (let i = 1; i <= 7; i++) {
      registry.register(createFighter(`fighter-${i}`));
    }

    const team = createTeam([
      "fighter-1",
      "fighter-2",
      "fighter-3",
      "fighter-4",
      "fighter-5",
      "fighter-6",
      "fighter-7",
      "unknown-fighter"
    ]);

    const result = validateTeamRoster(team, registry);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Fighter "unknown-fighter" is not registered.'
    );
  });

  it("rejects an eliminated fighter", () => {
    const registry = new FighterRegistry();

    for (let i = 1; i <= 8; i++) {
      registry.register(createFighter(`fighter-${i}`));
    }

    const team = createTeam([
      "fighter-1",
      "fighter-2",
      "fighter-3",
      "fighter-4",
      "fighter-5",
      "fighter-6",
      "fighter-7",
      "fighter-8"
    ]);

    team.eliminatedFighters = ["fighter-8"];

    const result = validateTeamRoster(team, registry);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Fighter "fighter-8" is eliminated and cannot be in the active roster.'
    );
  });
});
