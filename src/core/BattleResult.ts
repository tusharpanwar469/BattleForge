export interface BattleResult {
  winnerTeamId: string;
  loserTeamId: string;
  round: number;
  reason: string;
  factors: Record<string, number>;
}
