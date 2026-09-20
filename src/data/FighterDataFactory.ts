import type { BattleFactors } from "../core/BattleFactors";
import type { FighterDefinition } from "../core/FighterDefinition";

export interface FighterDataInput {
  id: string;
  name: string;
  factors: BattleFactors;
  peakScreenState: string;
  sources: string[];
  feats: string[];
}

export function createFighterDefinition(
  input: FighterDataInput
): FighterDefinition {
  return {
    id: input.id,
    name: input.name,
    factors: { ...input.factors },
    peakScreenState: input.peakScreenState,
    sources: [...input.sources],
    feats: [...input.feats]
  };
}