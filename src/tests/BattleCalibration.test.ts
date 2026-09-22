import { describe, expect, it } from "vitest";
import {
  DEFAULT_BATTLE_CALIBRATION
} from "../config/BattleCalibration";

describe("BattleCalibration", () => {
  it("defines an explicit calibration version", () => {
    expect(DEFAULT_BATTLE_CALIBRATION.version).toBe("lab-v0");
  });

  it("marks the default calibration as experimental", () => {
    expect(DEFAULT_BATTLE_CALIBRATION.status).toBe("EXPERIMENTAL");
  });

  it("contains all 12 battle factor weights", () => {
    expect(
      Object.keys(DEFAULT_BATTLE_CALIBRATION.factorWeights)
    ).toHaveLength(12);
  });

  it("does not silently claim production approval", () => {
    expect(DEFAULT_BATTLE_CALIBRATION.status).not.toBe("APPROVED");
  });
});