import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";

describe("FighterDefinition", () => {
  it("supports cinematic fighter data with BattleForge factors", () => {
    const fighter: FighterDefinition = {
      id: "test-fighter",
      name: "Test Fighter",
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
      peakScreenState: "Peak cinematic state",
      sources: ["Test source"],
      feats: ["Test feat"]
    };

    expect(fighter.factors.power).toBe(10);
    expect(fighter.peakScreenState).toBe("Peak cinematic state");
    expect(fighter.sources.length).toBe(1);
    expect(fighter.feats.length).toBe(1);
  });
});
