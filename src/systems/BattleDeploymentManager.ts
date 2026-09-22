import type { BattleDeployment } from "../core/BattleDeployment";
import type { TeamState } from "../core/TeamState";
import type { FighterRegistry } from "./FighterRegistry";
import {
  validateBattleDeployment,
  type BattleDeploymentValidationResult
} from "./BattleDeploymentValidator";

export interface DeploymentOperationResult {
  success: boolean;
  deployment?: BattleDeployment;
  errors: string[];
}

export class BattleDeploymentManager {
  constructor(private readonly registry: FighterRegistry) {}

  createDeployment(
    team: TeamState,
    fighterIds: string[]
  ): DeploymentOperationResult {
    const deployment: BattleDeployment = {
      teamId: team.id,
      fighterIds: [...fighterIds]
    };

    return this.validateAndReturn(deployment, team);
  }

  updateDeployment(
    team: TeamState,
    deployment: BattleDeployment
  ): DeploymentOperationResult {
    const updatedDeployment: BattleDeployment = {
      teamId: deployment.teamId,
      fighterIds: [...deployment.fighterIds]
    };

    return this.validateAndReturn(updatedDeployment, team);
  }

  private validateAndReturn(
    deployment: BattleDeployment,
    team: TeamState
  ): DeploymentOperationResult {
    const validation: BattleDeploymentValidationResult =
      validateBattleDeployment(deployment, team);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    for (const fighterId of deployment.fighterIds) {
      if (!this.registry.has(fighterId)) {
        return {
          success: false,
          errors: [`Fighter "${fighterId}" is not registered.`]
        };
      }
    }

    return {
      success: true,
      deployment,
      errors: []
    };
  }
}