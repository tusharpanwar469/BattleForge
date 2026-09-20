import { describe, expect, it } from "vitest";
import {
  createFighterDefinition,
  type FighterDataInput
} from "../data/FighterDataFactory";

const createInput = (): FighterDataInput => ({
  id: "iron-man",
  name: "Iron Man",
  factors: {
    power: 8,
    durability: 8,
    speed: 7,
    intelligence: 9,
    combatSkill: 8,
    abilities: 8,
    equipment: 9,
    battlefield: 8,
    endurance: 7,
    teamwork: 9,
    magic: 0,
    technology: 10
  },
  peakScreenState: "Peak cinematic screen state",
  sources: ["Test source"],
  feats: ["Test feat"]
});

describe("FighterDataFactory", () => {
  it("creates a complete fighter definition", () => {
    const fighter = createFighterDefinition(createInput());

    expect(fighter.id).toBe("iron-man");
    expect(fighter.name).toBe("Iron Man");
    expect(fighter.factors.technology).toBe(10);
    expect(fighter.peakScreenState).toBe("Peak cinematic screen state");
    expect(fighter.sources).toEqual(["Test source"]);
    expect(fighter.feats).toEqual(["Test feat"]);
  });

  it("creates independent factor and array copies", () => {
    const input = createInput();
    const fighter = createFighterDefinition(input);

    fighter.factors.power = 1;
    fighter.sources.push("Another source");
    fighter.feats.push("Another feat");

    expect(input.factors.power).toBe(8);
    expect(input.sources).toEqual(["Test source"]);
    expect(input.feats).toEqual(["Test feat"]);
  });
});