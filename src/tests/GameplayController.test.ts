import { describe, expect, it } from "vitest";
import type { BattleDeployment } from "../core/BattleDeployment";
import type { BattleFactors } from "../core/BattleFactors";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { FighterState } from "../core/FighterState";
import type { GameState } from "../core/GameState";
import type { TeamState } from "../core/TeamState";
import { BattleConsequenceManager } from "../systems/BattleConsequenceManager";
import { BattleEngine } from "../systems/BattleEngine";
import { BattleResolutionOrchestrator } from "../systems/BattleResolutionOrchestrator";
import { FighterRegistry } from "../systems/FighterRegistry";
import { GameplayController } from "../systems/GameplayController";
import { WarProgressionManager } from "../systems/WarProgressionManager";

function createFactors(value: number): BattleFactors {
  return {
    power: value,
    durability: value,
    speed: value,
    intelligence: value,
    combatSkill: value,
    abilities: value,
    equipment: value,
    battlefield: value,
    endurance: value,
    teamwork: value,
    magic: value,
    technology: value
  };
}

function createTeam(id: string): TeamState {
  return {
    id,
    name: id,
    budget: 220,
    roster: [],
    eliminatedFighters: []
  };
}

function createFighter(id: string, teamId: string): FighterState {
  return {
    id,
    name: id,
    teamId,
    isAlive: true,
    isDeployed: false,
    fatigue: 0
  };
}

function createDefinition(
  id: string,
  value: number
): FighterDefinition {
  return {
    id,
    name: id,
    factors: createFactors(value),
    peakScreenState: "Peak cinematic state",
    sources: ["Test source"],
    feats: ["Test feat"]
  };
}

function createGameState(
  phase: GameState["phase"],
  round = 1
): GameState {
  return { phase, round, isPaused: false };
}

function createController(): GameplayController {
  return new GameplayController(
    new BattleResolutionOrchestrator(
      new BattleEngine(),
      new BattleConsequenceManager()
    ),
    new WarProgressionManager()
  );
}

function createReadyWar() {
  const teams = ["team-a", "team-b", "team-c", "team-d"].map(createTeam);
  const fighters: FighterState[] = [];
  const registry = new FighterRegistry();

  for (const team of teams) {
    const value =
      team.id === "team-a" ? 10 :
      team.id === "team-b" ? 1 : 5;

    for (let index = 0; index < 8; index += 1) {
      const id = `${team.id}-fighter-${index}`;
      team.roster.push(id);
      fighters.push(createFighter(id, team.id));
      registry.register(createDefinition(id, value));
    }
  }

  return { teams, fighters, registry };
}

describe("GameplayController", () => {
  it("starts the war when every team has at least 8 living fighters", () => {
    const controller = createController();
    const { teams, fighters } = createReadyWar();
    const gameState = createGameState("auction");

    const nextState = controller.startWar(gameState, teams, fighters);

    expect(nextState.phase).toBe("battle");
    expect(nextState.round).toBe(1);
    expect(gameState.phase).toBe("auction");
  });

  it("rejects starting the war when a team is not ready", () => {
    const controller = createController();
    const { teams, fighters } = createReadyWar();
    fighters.splice(
      0,
      fighters.length,
      ...fighters.filter((fighter) => fighter.teamId !== "team-c")
    );

    expect(() =>
      controller.startWar(createGameState("auction"), teams, fighters)
    ).toThrow('Team "team-c" has 0 living fighters');
  });

  it("rejects starting the war outside the auction phase", () => {
    const controller = createController();
    const { teams, fighters } = createReadyWar();

    expect(() =>
      controller.startWar(createGameState("battle"), teams, fighters)
    ).toThrow("The war can only start from the auction phase.");
  });

  it("resolves a battle and transitions to results", () => {
    const controller = createController();
    const { teams, fighters, registry } = createReadyWar();
    const [teamA, teamB] = teams;
    const fighterA = `${teamA.id}-fighter-0`;
    const fighterB = `${teamB.id}-fighter-0`;

    const outcome = controller.resolveBattle(
      createGameState("battle"),
      teamA,
      { teamId: teamA.id, fighterIds: [fighterA] } satisfies BattleDeployment,
      teamB,
      { teamId: teamB.id, fighterIds: [fighterB] } satisfies BattleDeployment,
      fighters,
      registry,
      teams
    );

    expect(outcome.gameState.phase).toBe("results");
    expect(outcome.gameState.round).toBe(1);
    expect(outcome.resolution.battleResult.winnerTeamId).toBe(teamA.id);
    expect(outcome.resolution.warComplete).toBe(false);
    expect(fighters.find((fighter) => fighter.id === fighterB)?.isAlive)
      .toBe(false);
  });

  it("starts the next round after a non-final battle", () => {
    const controller = createController();
    const { teams, fighters, registry } = createReadyWar();
    const [teamA, teamB] = teams;

    const outcome = controller.resolveBattle(
      createGameState("battle"),
      teamA,
      { teamId: teamA.id, fighterIds: [`${teamA.id}-fighter-0`] },
      teamB,
      { teamId: teamB.id, fighterIds: [`${teamB.id}-fighter-0`] },
      fighters,
      registry,
      teams
    );

    const nextState = controller.beginNextRound(
      outcome.gameState,
      outcome
    );

    expect(nextState.phase).toBe("battle");
    expect(nextState.round).toBe(2);
  });

  it("rejects another round when the war has ended", () => {
    const controller = createController();
    const { teams, fighters, registry } = createReadyWar();
    const [teamA, teamB] = teams;

    // Empty the other teams so the winning team becomes the sole survivor.
    for (const team of teams.slice(2)) {
      for (const fighter of fighters.filter((item) => item.teamId === team.id)) {
        fighter.isAlive = false;
      }
      team.roster.length = 0;
    }

    const outcome = controller.resolveBattle(
      createGameState("battle"),
      teamA,
      { teamId: teamA.id, fighterIds: [`${teamA.id}-fighter-0`] },
      teamB,
      { teamId: teamB.id, fighterIds: [`${teamB.id}-fighter-0`] },
      fighters,
      registry,
      teams
    );

    expect(outcome.resolution.warComplete).toBe(true);

    expect(() =>
      controller.beginNextRound(outcome.gameState, outcome)
    ).toThrow("The war is complete; no further rounds can begin.");
  });

  it("rejects resolving a battle outside the battle phase", () => {
    const controller = createController();
    const { teams, fighters, registry } = createReadyWar();
    const [teamA, teamB] = teams;

    expect(() =>
      controller.resolveBattle(
        createGameState("results"),
        teamA,
        { teamId: teamA.id, fighterIds: [`${teamA.id}-fighter-0`] },
        teamB,
        { teamId: teamB.id, fighterIds: [`${teamB.id}-fighter-0`] },
        fighters,
        registry,
        teams
      )
    ).toThrow("A battle can only be resolved during the battle phase.");
  });
});