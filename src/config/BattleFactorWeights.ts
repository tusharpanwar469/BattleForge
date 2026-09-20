import type { BattleFactors } from "../core/BattleFactors";

export type BattleFactorWeights = {
  [K in keyof BattleFactors]: number;
};

export const DEFAULT_BATTLE_FACTOR_WEIGHTS: BattleFactorWeights = {
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
