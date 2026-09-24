import { describe, expect, it } from "vitest";
import { BattleEngine } from "../systems/BattleEngine";
import type { BattleFactors } from "../core/BattleFactors";
import {
  DEFAULT_BATTLE_CALIBRATION
} from "../config/BattleCalibration";

describe("BattleEngine", () => {
  it("uses the default calibration factor weights", () => {
    const engine = new BattleEngine();

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

    expect(engine.calculateScore(factors)).toBe(
      Object.values(DEFAULT_BATTLE_CALIBRATION.factorWeights).reduce(
        (total, weight) => total + weight,
        0
      )
    );
  });
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
