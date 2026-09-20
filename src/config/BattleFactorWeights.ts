import type { BattleFactors } from "../core/BattleFactors";

export type BattleFactorWeights = {
  [K in keyof BattleFactors]: number;
};