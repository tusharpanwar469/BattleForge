export interface FighterState {
  id: string;
  name: string;
  teamId: string | null;
  isAlive: boolean;
  isDeployed: boolean;
  fatigue: number;
}
