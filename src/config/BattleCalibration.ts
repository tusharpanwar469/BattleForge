import type { BattleFactorWeights } from "./BattleFactorWeights";
import {
  DEFAULT_BATTLE_FACTOR_WEIGHTS
} from "./BattleFactorWeights";

export type BattleCalibrationStatus =
  | "EXPERIMENTAL"
  | "APPROVED";

export interface BattleCalibrationConfig {
  version: string;
  status: BattleCalibrationStatus;
  factorWeights: BattleFactorWeights;
}

export const DEFAULT_BATTLE_CALIBRATION: BattleCalibrationConfig = {
  version: "lab-v0",
  status: "EXPERIMENTAL",
  factorWeights: DEFAULT_BATTLE_FACTOR_WEIGHTS
};