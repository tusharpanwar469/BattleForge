import type {
  BattleLabInputSnapshot,
  BattleLabResult,
  BattleLabScenario
} from "../core/BattleLab";
import type { BattleResult } from "../core/BattleResult";
import { BattleEngine } from "./BattleEngine";
import { validateBattleDeployment } from "./BattleDeploymentValidator";
import type { FighterRegistry } from "./FighterRegistry";

export class BattleLabRunner {
  constructor(
    private readonly engine: BattleEngine,
    private readonly registry: FighterRegistry
  ) {}

  runScenario(
    scenario: BattleLabScenario,
    input: BattleLabInputSnapshot
  ): BattleLabResult {
    const validationErrors: string[] = [];

    const validationA = validateBattleDeployment(
      input.deploymentA,
      input.teamA
    );
    const validationB = validateBattleDeployment(
      input.deploymentB,
      input.teamB
    );

    validationErrors.push(...validationA.errors, ...validationB.errors);

    if (validationErrors.length > 0) {
      throw new Error(
        `Battle Lab scenario "${scenario.id}" is invalid: ${validationErrors.join(
          " "
        )}`
      );
    }

    const result = this.engine.resolveBattle(
      input.gameState,
      input.teamA,
      input.deploymentA,
      input.teamB,
      input.deploymentB,
      this.registry
    );

    const validationNotes = this.validateResult(result, scenario, input);

    return {
      scenarioId: scenario.id,
      input,
      result,
      eventTrace: result.events.map((event) => ({
        event: event.type,
        description: event.description
      })),
      explanation: result.reason,
      validation: {
        isValid: validationNotes.length === 0,
        notes: validationNotes
      }
    };
  }

  private validateResult(
    result: BattleResult,
    scenario: BattleLabScenario,
    input: BattleLabInputSnapshot
  ): string[] {
    const notes: string[] = [];
    const participatingTeamIds = [input.teamA.id, input.teamB.id];

    if (
      result.winnerTeamId === result.loserTeamId ||
      !participatingTeamIds.includes(result.winnerTeamId) ||
      !participatingTeamIds.includes(result.loserTeamId)
    ) {
      notes.push(
        "Battle result winner and loser must be different participating teams."
      );
    }

    if (result.winnerTeamId !== scenario.expectedWinnerTeamId) {
      notes.push(
        `Expected winner "${scenario.expectedWinnerTeamId}", but Battle Engine reported "${result.winnerTeamId}".`
      );
    }

    if (result.round !== input.gameState.round) {
      notes.push(
        `Battle result round ${result.round} does not match game state round ${input.gameState.round}.`
      );
    }

    const actualEventTypes = result.events.map((event) => event.type);

    if (
      actualEventTypes.length !== scenario.expectedEventTypes.length ||
      actualEventTypes.some(
        (eventType, index) =>
          eventType !== scenario.expectedEventTypes[index]
      )
    ) {
      notes.push(
        `Expected event sequence [${scenario.expectedEventTypes.join(
          ", "
        )}], but Battle Engine reported [${actualEventTypes.join(", ")}].`
      );
    }

    for (const event of result.events) {
      if (event.round !== result.round) {
        notes.push(
          `Battle event "${event.type}" has round ${event.round}, but battle result round is ${result.round}.`
        );
      }

      if (!event.description.trim()) {
        notes.push(
          `Battle event "${event.type}" must have a non-empty description.`
        );
      }
    }

    return notes;
  }
}