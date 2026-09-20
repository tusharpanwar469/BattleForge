import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import {
  validateFighterDataset,
  validateFighterDefinition
} from "../systems/FighterDataValidator";
const validFactors = {
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
};

const validFighter: FighterDefinition = {
  id: "fighter-001",
  name: "Test Fighter",
  factors: validFactors,
  peakScreenState: "Peak cinematic state",
  sources: ["Test Source"],
  feats: ["Test Feat"]
};

describe("validateFighterDefinition", () => {
  it("accepts a valid fighter definition", () => {
    const result = validateFighterDefinition(validFighter);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects missing required metadata", () => {
    const fighter: FighterDefinition = {
      ...validFighter,
      id: "",
      name: "",
      peakScreenState: "",
      sources: [],
      feats: []
    };

    const result = validateFighterDefinition(fighter);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Fighter id is required.");
    expect(result.errors).toContain("Fighter name is required.");
    expect(result.errors).toContain("Peak screen state is required.");
    expect(result.errors).toContain("At least one source is required.");
    expect(result.errors).toContain("At least one feat is required.");
  });

  it("rejects non-finite battle factor values", () => {
    const fighter: FighterDefinition = {
      ...validFighter,
      factors: {
        ...validFactors,
        power: Number.NaN
      }
    };

    const result = validateFighterDefinition(fighter);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Battle factor 'power' must be a finite number."
    );
  });
});

describe("validateFighterDataset", () => {
  it("accepts a valid fighter dataset", () => {
    const result = validateFighterDataset([validFighter]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects duplicate fighter ids", () => {
    const result = validateFighterDataset([
      validFighter,
      { ...validFighter }
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Duplicate fighter id: "fighter-001".'
    );
  });
});