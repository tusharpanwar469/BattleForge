import type {
  BattleLabInputSnapshot,
  BattleLabResult,
  BattleLabScenario,
} from "../core/BattleLab";
import type { BattleResult } from "../core/BattleResult";
import { BattleEngine } from "./BattleEngine";
import { validateBattleDeployment } from "./BattleDeploymentValidator";
import type { FighterRegistry } from "./FighterRegistry";

export class BattleLabRunner {
  constructor(
    private readonly engine: BattleEngine,
    private readonly registry: FighterRegistry,
  ) {}

  runScenario(
    scenario: BattleLabScenario,
    input: BattleLabInputSnapshot,
  ): BattleLabResult {
    const scenarioId =
      typeof scenario?.id === "string" ? scenario.id : "<invalid>";

    const inputErrors = this.validateInput(scenario, input);

    if (inputErrors.length > 0) {
      throw new Error(
        `Battle Lab scenario "${scenarioId}" is invalid: ${inputErrors.join(" ")}`,
      );
    }

    const snapshot = this.createSnapshot(input);

    const result = this.engine.resolveBattle(
      snapshot.gameState,
      snapshot.teamA,
      snapshot.deploymentA,
      snapshot.teamB,
      snapshot.deploymentB,
      this.registry,
    );

    const validationNotes = this.validateResult(result, scenario, snapshot);

    const events = Array.isArray(result?.events) ? result.events : [];

    return {
      scenarioId: scenario.id,
      input: snapshot,
      result,
      eventTrace: events.map((event) => ({
        event: event && typeof event.type === "string" ? event.type : "UNKNOWN",
        description:
          event && typeof event.description === "string"
            ? event.description
            : "",
      })),
      explanation: typeof result?.reason === "string" ? result.reason : "",
      validation: {
        isValid: validationNotes.length === 0,
        notes: validationNotes,
      },
    };
  }
  private validateInput(
    scenario: BattleLabScenario,
    input: BattleLabInputSnapshot,
  ): string[] {
    const errors: string[] = [];

    if (
      !scenario ||
      typeof scenario.id !== "string" ||
      !scenario.id.trim() ||
      typeof scenario.name !== "string" ||
      !scenario.name.trim() ||
      typeof scenario.description !== "string" ||
      !scenario.description.trim() ||
      typeof scenario.expectedWinnerTeamId !== "string" ||
      !scenario.expectedWinnerTeamId.trim() ||
      !Array.isArray(scenario.expectedEventTypes) ||
      scenario.expectedEventTypes.length === 0
    ) {
      errors.push("Scenario metadata is invalid.");
    }

    if (!input || !input.gameState || !input.teamA || !input.teamB) {
      errors.push("Battle Lab input is incomplete.");
      return errors;
    }

    if (!Number.isInteger(input.gameState.round) || input.gameState.round < 1) {
      errors.push("Game round must be a positive integer.");
    }

    if (input.gameState.phase !== "battle") {
      errors.push('Game state phase must be "battle".');
    }

    if (input.gameState.isPaused) {
      errors.push("Cannot run a Battle Lab scenario while the game is paused.");
    }

    if (
      !input.teamA.id.trim() ||
      !input.teamB.id.trim() ||
      input.teamA.id === input.teamB.id
    ) {
      errors.push("Battle teams must have distinct, non-empty IDs.");
    }

    const validationA = validateBattleDeployment(
      input.deploymentA,
      input.teamA,
    );
    const validationB = validateBattleDeployment(
      input.deploymentB,
      input.teamB,
    );

    errors.push(...validationA.errors, ...validationB.errors);

    for (const [label, deployment] of [
      ["Team A", input.deploymentA],
      ["Team B", input.deploymentB],
    ] as const) {
      if (Array.isArray(deployment?.fighterIds)) {
        const ids = deployment.fighterIds;
        const normalizedIds = ids.map((id) =>
          typeof id === "string" ? id.trim().toLowerCase() : "",
        );

        if (normalizedIds.some((id) => !id)) {
          errors.push(`${label} deployment contains an empty fighter ID.`);
        }

        if (new Set(normalizedIds).size !== normalizedIds.length) {
          errors.push(`${label} deployment contains duplicate fighter IDs.`);
        }
      }
    }

    return errors;
  }

  private createSnapshot(
    input: BattleLabInputSnapshot,
  ): BattleLabInputSnapshot {
    return {
      gameState: { ...input.gameState },
      teamA: {
        ...input.teamA,
        roster: [...input.teamA.roster],
        eliminatedFighters: [...input.teamA.eliminatedFighters],
      },
      teamB: {
        ...input.teamB,
        roster: [...input.teamB.roster],
        eliminatedFighters: [...input.teamB.eliminatedFighters],
      },
      deploymentA: {
        ...input.deploymentA,
        fighterIds: [...input.deploymentA.fighterIds],
      },
      deploymentB: {
        ...input.deploymentB,
        fighterIds: [...input.deploymentB.fighterIds],
      },
    };
  }

  private validateResult(
    result: BattleResult,
    scenario: BattleLabScenario,
    input: BattleLabInputSnapshot,
  ): string[] {
    const notes: string[] = [];
    const participatingTeamIds = [input.teamA.id, input.teamB.id];

    if (
      !result ||
      typeof result !== "object" ||
      typeof result.winnerTeamId !== "string" ||
      typeof result.loserTeamId !== "string"
    ) {
      return ["Battle Engine returned a malformed battle result."];
    }

    if (
      result.winnerTeamId === result.loserTeamId ||
      !participatingTeamIds.includes(result.winnerTeamId) ||
      !participatingTeamIds.includes(result.loserTeamId)
    ) {
      notes.push(
        "Battle result winner and loser must be different participating teams.",
      );
    }

    if (result.winnerTeamId !== scenario.expectedWinnerTeamId) {
      notes.push(
        `Expected winner "${scenario.expectedWinnerTeamId}", but Battle Engine reported "${result.winnerTeamId}".`,
      );
    }

    if (result.round !== input.gameState.round) {
      notes.push(
        `Battle result round ${result.round} does not match game state round ${input.gameState.round}.`,
      );
    }

    if (!Array.isArray(result.events)) {
      notes.push("Battle Engine returned an invalid event list.");
      return notes;
    }

    const actualEventTypes = result.events.map((event) => event?.type);

    if (
      actualEventTypes.length !== scenario.expectedEventTypes.length ||
      actualEventTypes.some(
        (eventType, index) => eventType !== scenario.expectedEventTypes[index],
      )
    ) {
      notes.push(
        `Expected event sequence [${scenario.expectedEventTypes.join(
          ", ",
        )}], but Battle Engine reported [${actualEventTypes.join(", ")}].`,
      );
    }

    for (const event of result.events) {
      if (!event || typeof event !== "object") {
        notes.push("Battle Engine returned a malformed event.");
        continue;
      }

      if (event.round !== result.round) {
        notes.push(
          `Battle event "${event.type}" has round ${event.round}, but battle result round is ${result.round}.`,
        );
      }

      if (typeof event.description !== "string" || !event.description.trim()) {
        notes.push(
          `Battle event "${event.type}" must have a non-empty description.`,
        );
      }
    }

    if (typeof result.reason !== "string" || !result.reason.trim()) {
      notes.push("Battle result must have a non-empty explanation.");
    }

    return notes;
  }
}
