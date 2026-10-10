import type { BattleResult } from "./BattleResult";
import type { BattleEventType } from "./BattleEvent";
import type { BattleDeployment } from "./BattleDeployment";
import type { GameState } from "./GameState";
import type { TeamState } from "./TeamState";

export interface BattleLabScenario {
  id: string;
  name: string;
  description: string;
  expectedWinnerTeamId: string;
  expectedEventTypes: BattleEventType[];
}

export interface BattleLabInputSnapshot {
  gameState: GameState;
  teamA: TeamState;
  teamB: TeamState;
  deploymentA: BattleDeployment;
  deploymentB: BattleDeployment;
}

export interface BattleLabEventTrace {
  event: string;
  description: string;
}

export interface BattleLabValidation {
  isValid: boolean;
  notes: string[];
}

export interface BattleLabResult {
  scenarioId: string;
  input: BattleLabInputSnapshot;
  result: BattleResult;
  eventTrace: BattleLabEventTrace[];
  explanation: string;
  validation: BattleLabValidation;
}