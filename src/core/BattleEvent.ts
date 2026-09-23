export type BattleEventType =
  | "CLASH"
  | "COUNTER"
  | "ADVANTAGE"
  | "CRITICAL"
  | "TURNING_POINT"
  | "ABILITY_OVERLOAD"
  | "PROTECTION"
  | "FALL"
  | "VICTORY";

export interface BattleEvent {
  type: BattleEventType;
  round: number;
  description: string;
}
