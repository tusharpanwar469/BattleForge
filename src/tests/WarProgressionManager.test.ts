import { describe, expect, it } from "vitest";
import type { BattleResult } from "../core/BattleResult";
import type { GameState } from "../core/GameState";
import { WarProgressionManager } from "../systems/WarProgressionManager";

function createGameState(
  phase: GameState["phase"] = "battle",
  round = 1
): GameState {
  return {
    phase,
    round,
    isPaused: false
  };
}

function createBattleResult(round = 1): BattleResult {
  return {
    winnerTeamId: "team-a",
    loserTeamId: "team-b",
    round,
    reason: "Team A won the battle.",
    factors: {
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
    }
  };
}

describe("WarProgressionManager", () => {
  it("moves a resolved battle from battle phase to results phase", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("battle", 1);
    const battleResult = createBattleResult(1);

    const nextState = manager.advanceAfterBattle(
      gameState,
      battleResult
    );

    expect(nextState.phase).toBe("results");
    expect(nextState.round).toBe(1);
    expect(nextState.isPaused).toBe(false);
  });

  it("rejects progression when the game is not in battle phase", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("results", 1);
    const battleResult = createBattleResult(1);

    expect(() =>
      manager.advanceAfterBattle(gameState, battleResult)
    ).toThrow(
      'War progression requires the game to be in the battle phase.'
    );
  });

  it("rejects an unresolved battle result", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("battle", 1);

    const unresolvedResult: BattleResult = {
      ...createBattleResult(1),
      winnerTeamId: "",
      loserTeamId: ""
    };

    expect(() =>
      manager.advanceAfterBattle(gameState, unresolvedResult)
    ).toThrow("War progression requires a resolved battle result.");
  });

  it("rejects a battle result from the wrong round", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("battle", 2);
    const battleResult = createBattleResult(1);

    expect(() =>
      manager.advanceAfterBattle(gameState, battleResult)
    ).toThrow(
      'Battle result round "1" does not match game round "2".'
    );
  });

  it("begins the next round from the results phase", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("results", 1);

    const nextState = manager.beginNextRound(gameState);

    expect(nextState.phase).toBe("battle");
    expect(nextState.round).toBe(2);
    expect(nextState.isPaused).toBe(false);
  });

  it("rejects starting the next round outside the results phase", () => {
    const manager = new WarProgressionManager();
    const gameState = createGameState("battle", 1);

    expect(() =>
      manager.beginNextRound(gameState)
    ).toThrow(
      'The next round can only begin from the results phase.'
    );
  });
});