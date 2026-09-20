import type { BattleFactors } from "../core/BattleFactors";
import type { BattleFactorWeights } from "../config/BattleFactorWeights";

export function calculateBattleScore(
  factors: BattleFactors,
  weights: BattleFactorWeights
): number {
  return (Object.keys(factors) as Array<keyof BattleFactors>).reduce(
    (total, factor) => total + factors[factor] * weights[factor],
    0
  );
}
