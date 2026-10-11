import type { BattleFactors } from "../core/BattleFactors";
import type { BattleFactorWeights } from "../config/BattleFactorWeights";

const BATTLE_FACTOR_KEYS: Array<keyof BattleFactors> = [
  "power",
  "durability",
  "speed",
  "intelligence",
  "combatSkill",
  "abilities",
  "equipment",
  "battlefield",
  "endurance",
  "teamwork",
  "magic",
  "technology",
];

export function calculateBattleScore(
  factors: BattleFactors,
  weights: BattleFactorWeights,
): number {
  for (const factor of BATTLE_FACTOR_KEYS) {
    if (!Number.isFinite(factors[factor])) {
      throw new Error(
        `Battle factor "${factor}" must be a finite number.`,
      );
    }

    if (!Number.isFinite(weights[factor])) {
      throw new Error(
        `Battle factor weight "${factor}" must be a finite number.`,
      );
    }
  }

  const score = BATTLE_FACTOR_KEYS.reduce(
    (total, factor) => total + factors[factor] * weights[factor],
    0,
  );

  if (!Number.isFinite(score)) {
    throw new Error("Calculated battle score must be a finite number.");
  }

  return score;
}