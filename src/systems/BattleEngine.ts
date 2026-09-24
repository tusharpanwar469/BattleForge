import type { BattleEvent } from "../core/BattleEvent";
import type { BattleDeployment } from "../core/BattleDeployment";
import type { BattleFactors } from "../core/BattleFactors";
import type { BattleResult } from "../core/BattleResult";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import {
  DEFAULT_BATTLE_CALIBRATION
} from "../config/BattleCalibration";
import type { BattleFactorWeights } from "../config/BattleFactorWeights";

import { calculateBattleScore } from "./BattleScoring";
import { validateBattleDeployment } from "./BattleDeploymentValidator";
import type { FighterRegistry } from "./FighterRegistry";

export class BattleEngine {
constructor(
  private readonly weights: BattleFactorWeights =
    DEFAULT_BATTLE_CALIBRATION.factorWeights
) {}
  calculateScore(factors: BattleFactors): number {
    return calculateBattleScore(factors, this.weights);
  }

  resolveBattle(
    gameState: GameState,
    teamA: TeamState,
    deploymentA: BattleDeployment,
    teamB: TeamState,
    deploymentB: BattleDeployment,
    registry: FighterRegistry
  ): BattleResult {
    const validationA = validateBattleDeployment(deploymentA, teamA);

    if (!validationA.isValid) {
      throw new Error(validationA.errors.join(" "));
    }

    const validationB = validateBattleDeployment(deploymentB, teamB);

    if (!validationB.isValid) {
      throw new Error(validationB.errors.join(" "));
    }

    const factorsA = this.aggregateDeploymentFactors(
      deploymentA,
      registry
    );

    const factorsB = this.aggregateDeploymentFactors(
      deploymentB,
      registry
    );

    const scoreA = this.calculateScore(factorsA);
    const scoreB = this.calculateScore(factorsB);

    if (scoreA === scoreB) {
      throw new Error(
        "Battle cannot be resolved because the deployment scores are tied."
      );
    }

    const teamAWins = scoreA > scoreB;

    const winnerTeamId = teamAWins ? teamA.id : teamB.id;
    const loserTeamId = teamAWins ? teamB.id : teamA.id;
    const winningFactors = teamAWins ? factorsA : factorsB;

    return {
      winnerTeamId,
      loserTeamId,
      round: gameState.round,
      reason:
        `${winnerTeamId} won with a battle score of ` +
        `${Math.max(scoreA, scoreB)} against ` +
        `${loserTeamId} with a battle score of ` +
        `${Math.min(scoreA, scoreB)}.`,
      factors: winningFactors,
      events: this.createBattleEvents(
  gameState.round,
  winnerTeamId,
  loserTeamId,
  scoreA,
  scoreB
      )
 };
  }
private createBattleEvents(
  round: number,
  winnerTeamId: string,
  loserTeamId: string,
  scoreA: number,
  scoreB: number
): BattleEvent[] {
  const winningScore = Math.max(scoreA, scoreB);
  const losingScore = Math.min(scoreA, scoreB);

  return [
    {
      type: "CLASH",
      round,
      description: "The two deployed teams engaged in battle."
    },
    {
      type: "ADVANTAGE",
      round,
      description:
        `${winnerTeamId} gained the advantage with a battle score of ` +
        `${winningScore} against ${loserTeamId} with ` +
        `${losingScore}.`
    },
    {
      type: "VICTORY",
      round,
      description:
        `${winnerTeamId} achieved victory over ${loserTeamId}.`
    }
  ];
}
  private aggregateDeploymentFactors(
    deployment: BattleDeployment,
    registry: FighterRegistry
  ): BattleFactors {
    const total: BattleFactors = {
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
    };

    for (const fighterId of deployment.fighterIds) {
      const fighter = registry.getById(fighterId);

      if (!fighter) {
        throw new Error(`Fighter "${fighterId}" is not registered.`);
      }

      total.power += fighter.factors.power;
      total.durability += fighter.factors.durability;
      total.speed += fighter.factors.speed;
      total.intelligence += fighter.factors.intelligence;
      total.combatSkill += fighter.factors.combatSkill;
      total.abilities += fighter.factors.abilities;
      total.equipment += fighter.factors.equipment;
      total.battlefield += fighter.factors.battlefield;
      total.endurance += fighter.factors.endurance;
      total.teamwork += fighter.factors.teamwork;
      total.magic += fighter.factors.magic;
      total.technology += fighter.factors.technology;
    }

    return total;
  }
}