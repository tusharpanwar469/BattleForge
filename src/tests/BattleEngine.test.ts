import { describe, expect, it } from "vitest";
import { BattleEngine } from "../systems/BattleEngine";
import type { BattleFactors } from "../core/BattleFactors";

describe("BattleEngine", () => {
  it("calculates a weighted battle score", () => {
    const engine = new BattleEngine();

    const factors: BattleFactors = {
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

    expect(engine.calculateScore(factors)).toBe(120);
  });
});
