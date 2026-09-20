import { describe, expect, it } from "vitest";
import { BattleEngine } from "../systems/BattleEngine";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";

describe("BattleEngine", () => {
  it("returns a valid battle result structure", () => {
    const engine = new BattleEngine();

    const gameState: GameState = {
      phase: "battle",
      round: 1,
      isPaused: false
    };

    const teamA: TeamState = {
      id: "team-a",
      name: "Team A",
      budget: 220,
      roster: [],
      eliminatedFighters: []
    };

    const teamB: TeamState = {
      id: "team-b",
      name: "Team B",
      budget: 220,
      roster: [],
      eliminatedFighters: []
    };

    const result = engine.resolveBattle(gameState, teamA, teamB);

    expect(result).toHaveProperty("winnerTeamId");
    expect(result).toHaveProperty("loserTeamId");
    expect(result).toHaveProperty("round");
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("factors");

    expect(Object.keys(result.factors)).toHaveLength(12);
  });
});
