import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import { loadFighterDataset } from "../systems/FighterDatasetLoader";
import { FighterRegistry } from "../systems/FighterRegistry";

const createFighter = (
  id: string,
  name: string
): FighterDefinition => ({
  id,
  name,
  factors: {
    power: 8,
    durability: 8,
    speed: 7,
    intelligence: 9,
    combatSkill: 8,
    abilities: 8,
    equipment: 8,
    battlefield: 8,
    endurance: 7,
    teamwork: 9,
    magic: 0,
    technology: 8
  },
  peakScreenState: "Peak cinematic screen state",
  sources: ["Test source"],
  feats: ["Test feat"]
});

describe("FighterDatasetLoader", () => {
  it("loads multiple valid fighters into the registry", () => {
    const registry = new FighterRegistry();

    const fighters = [
      createFighter("iron-man", "Iron Man"),
      createFighter("captain-america", "Captain America"),
      createFighter("thor", "Thor")
    ];

    loadFighterDataset(fighters, registry);

    expect(registry.size).toBe(3);
    expect(registry.has("iron-man")).toBe(true);
    expect(registry.has("captain-america")).toBe(true);
    expect(registry.has("thor")).toBe(true);
  });

  it("keeps the registered fighter definitions intact", () => {
    const registry = new FighterRegistry();

    const fighters = [
      createFighter("iron-man", "Iron Man"),
      createFighter("thor", "Thor")
    ];

    loadFighterDataset(fighters, registry);

    expect(registry.getById("iron-man")).toEqual(fighters[0]);
    expect(registry.getById("thor")).toEqual(fighters[1]);
  });

  it("rejects invalid fighter data through the registry", () => {
    const registry = new FighterRegistry();

    const fighters = [
      createFighter("iron-man", "Iron Man"),
      {
        ...createFighter("", ""),
      }
    ];

    expect(() => loadFighterDataset(fighters, registry)).toThrow(
      "Invalid fighter"
    );

    expect(registry.size).toBe(1);
    expect(registry.has("iron-man")).toBe(true);
  });

  it("rejects duplicate fighter IDs through the registry", () => {
    const registry = new FighterRegistry();

    const fighters = [
      createFighter("iron-man", "Iron Man"),
      createFighter("iron-man", "Another Iron Man")
    ];

    expect(() => loadFighterDataset(fighters, registry)).toThrow(
      'Fighter with id "iron-man" is already registered.'
    );

    expect(registry.size).toBe(1);
  });
});