import type { FighterDefinition } from "../core/FighterDefinition";
import type { BattleFactors } from "../core/BattleFactors";

export interface FighterValidationResult {
  isValid: boolean;
  errors: string[];
}

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
  "technology"
];

export function validateFighterDefinition(
  fighter: FighterDefinition
): FighterValidationResult {
  const errors: string[] = [];

  if (!fighter.id.trim()) {
    errors.push("Fighter id is required.");
  }

  if (!fighter.name.trim()) {
    errors.push("Fighter name is required.");
  }

  if (!fighter.peakScreenState.trim()) {
    errors.push("Peak screen state is required.");
  }

  if (!Array.isArray(fighter.sources) || fighter.sources.length === 0) {
    errors.push("At least one source is required.");
  }

  if (!Array.isArray(fighter.feats) || fighter.feats.length === 0) {
    errors.push("At least one feat is required.");
  }

  for (const factor of BATTLE_FACTOR_KEYS) {
    const value = fighter.factors[factor];

    if (!Number.isFinite(value)) {
      errors.push(`Battle factor '${factor}' must be a finite number.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}