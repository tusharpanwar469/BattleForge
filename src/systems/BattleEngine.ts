import type { BattleFactors } from "../core/BattleFactors";
import type { BattleResult } from "../core/BattleResult";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import {
  DEFAULT_BATTLE_FACTOR_WEIGHTS,
  type BattleFactorWeights
} from "../config/BattleFactorWeights";
import { calculateBattleScore } from "./BattleScoring";

export class BattleEngine {
  constructor(
    private readonly weights: BattleFactorWeights = DEFAULT_BATTLE_FACTOR_WEIGHTS
  ) {}

  calculateScore(factors: BattleFactors): number {
    return calculateBattleScore(factors, this.weights);
  }

  resolveBattle(
    gameState: GameState,
    teamA: TeamState,
    teamB: TeamState
  ): BattleResult {
    void gameState;
    void teamA;
    void teamB;

    return {
      winnerTeamId: "",
      loserTeamId: "",
      round: 0,
      reason: "Battle resolution not implemented yet.",
      factors: {
        power: 0,
        durability: 0,
        speed: 0,
        intelligence: 0,
        combatSkill: 0,
        abilities: 0,
        equipment: 0,
        battlefield: 0,
        endurance: 0,
        teamwork: 0,
        magic: 0,
        technology: 0
      }
    };
  }
}