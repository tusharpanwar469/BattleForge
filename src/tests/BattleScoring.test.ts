import { describe, expect, it } from "vitest";
import { calculateBattleScore } from "../systems/BattleScoring";
import type { BattleFactors } from "../core/BattleFactors";
import { DEFAULT_BATTLE_FACTOR_WEIGHTS } from "../config/BattleFactorWeights";

describe("BattleScoring", () => {
  it("calculates the weighted score across all 12 factors", () => {
    const factors: BattleFactors = {
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
    };

    const score = calculateBattleScore(
      factors,
      DEFAULT_BATTLE_FACTOR_WEIGHTS
    );

    expect(score).toBe(12);
  });
});
