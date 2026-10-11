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
  it("rejects non-finite factor values", () => {
    const factors: BattleFactors = {
      power: Number.NaN,
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
      technology: 1,
    };

    expect(() =>
      calculateBattleScore(factors, DEFAULT_BATTLE_FACTOR_WEIGHTS),
    ).toThrow('Battle factor "power" must be a finite number.');
  });

  it("rejects non-finite calibration weights", () => {
    const weights = {
      ...DEFAULT_BATTLE_FACTOR_WEIGHTS,
      power: Number.POSITIVE_INFINITY,
    };

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
      technology: 1,
    };

    expect(() => calculateBattleScore(factors, weights)).toThrow(
      'Battle factor weight "power" must be a finite number.',
    );
  });

  it("rejects a non-finite final score", () => {
    const factors: BattleFactors = {
      power: Number.MAX_VALUE,
      durability: Number.MAX_VALUE,
      speed: 1,
      intelligence: 1,
      combatSkill: 1,
      abilities: 1,
      equipment: 1,
      battlefield: 1,
      endurance: 1,
      teamwork: 1,
      magic: 1,
      technology: 1,
    };

    expect(() =>
      calculateBattleScore(factors, DEFAULT_BATTLE_FACTOR_WEIGHTS),
    ).toThrow("Calculated battle score must be a finite number.");
  });
});
