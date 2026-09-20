import type { BattleFactors } from "./BattleFactors";

export interface FighterDefinition {
  id: string;
  name: string;
  factors: BattleFactors;
  peakScreenState: string;
  sources: string[];
  feats: string[];
}
