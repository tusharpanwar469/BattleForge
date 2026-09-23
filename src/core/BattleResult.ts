import type { BattleEvent } from "./BattleEvent";
import type { BattleFactors } from "./BattleFactors";

export interface BattleResult {
  winnerTeamId: string;
  loserTeamId: string;
  round: number;
  reason: string;
  factors: BattleFactors;
  events: BattleEvent[];
}
