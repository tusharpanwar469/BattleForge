import { describe, expect, it } from "vitest";
import type { TeamState } from "../core/TeamState";
import { FighterRegistry } from "../systems/FighterRegistry";
import { TeamRosterManager } from "../systems/TeamRosterManager";


describe("TeamRosterManager", () => {
  const createTeam = (): TeamState => ({
    id: "team-a",
    name: "Team A",
    budget: 220,
    roster: [],
    eliminatedFighters: []
  });

  const createManager = (): TeamRosterManager => {
    const registry = new FighterRegistry();

    registry.register({
        id: "iron-man",
        name: "Iron Man",
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
        peakScreenState: "test",
        sources: ["test"],
        feats: ["test"]
    });

    return new TeamRosterManager(registry);
};

  it("adds a registered fighter to a team", () => {
    const team = createTeam();
    const manager = createManager();

    const result = manager.addFighter(team, "iron-man");

    expect(result.success).toBe(true);
    expect(team.roster).toEqual(["iron-man"]);
  });

  it("prevents duplicate fighters", () => {
    const team = createTeam();
    const manager = createManager();

    manager.addFighter(team, "iron-man");

    const result = manager.addFighter(team, "iron-man");

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Fighter "iron-man" is already on the team roster.'
    );
  });

  it("prevents unregistered fighters", () => {
    const team = createTeam();
    const manager = createManager();

    const result = manager.addFighter(team, "unknown-fighter");

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Fighter "unknown-fighter" is not registered.'
    );
  });

  it("removes a fighter from the roster", () => {
    const team = createTeam();
    const manager = createManager();

    manager.addFighter(team, "iron-man");

    const result = manager.removeFighter(team, "iron-man");

    expect(result.success).toBe(true);
    expect(team.roster).toEqual([]);
  });

  it("prevents removing a fighter that is not on the roster", () => {
    const team = createTeam();
    const manager = createManager();

    const result = manager.removeFighter(team, "iron-man");

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Fighter "iron-man" is not on the team roster.'
    );
  });
});
