import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import { FighterRegistry } from "../systems/FighterRegistry";

const validFighter: FighterDefinition = {
  id: "iron-man",
  name: "Iron Man",
  factors: {
    power: 8,
    durability: 8,
    speed: 7,
    intelligence: 10,
    combatSkill: 7,
    abilities: 8,
    equipment: 10,
    battlefield: 8,
    endurance: 7,
    teamwork: 9,
    magic: 0,
    technology: 10
  },
  peakScreenState: "Avengers: Endgame peak screen state",
  sources: ["Avengers: Endgame"],
  feats: ["Defeated Thanos with the Infinity Stones"]
};

describe("FighterRegistry", () => {
  it("registers and retrieves a valid fighter", () => {
    const registry = new FighterRegistry();

    registry.register(validFighter);

    expect(registry.has("iron-man")).toBe(true);
    expect(registry.getById("iron-man")).toEqual(validFighter);
    expect(registry.size).toBe(1);
  });

  it("rejects duplicate fighter IDs", () => {
    const registry = new FighterRegistry();

    registry.register(validFighter);

    expect(() => registry.register(validFighter)).toThrow(
      'Fighter with id "iron-man" is already registered.'
    );
  });

  it("rejects invalid fighter data", () => {
    const registry = new FighterRegistry();

    const invalidFighter: FighterDefinition = {
      ...validFighter,
      id: "",
      name: ""
    };

    expect(() => registry.register(invalidFighter)).toThrow(
      "Invalid fighter"
    );

    expect(registry.size).toBe(0);
  });

  it("returns all registered fighters", () => {
    const registry = new FighterRegistry();

    const secondFighter: FighterDefinition = {
      ...validFighter,
      id: "captain-america",
      name: "Captain America"
    };

    registry.register(validFighter);
    registry.register(secondFighter);

    expect(registry.getAll()).toEqual([
      validFighter,
      secondFighter
    ]);

    expect(registry.size).toBe(2);
  });

  it("clears all registered fighters", () => {
    const registry = new FighterRegistry();

    registry.register(validFighter);

    registry.clear();

    expect(registry.size).toBe(0);
    expect(registry.has("iron-man")).toBe(false);
  });
});