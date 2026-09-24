import type {
  BattleLabInputSnapshot,
  BattleLabResult,
  BattleLabScenario
} from "../core/BattleLab";
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

    validationErrors.push(...validationA.errors);
    validationErrors.push(...validationB.errors);

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
        isValid: true,
        notes: []
      }
    };
  }
}
