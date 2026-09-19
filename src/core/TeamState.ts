export interface TeamState {
  id: string;
  name: string;
  budget: number;
  roster: string[];
  eliminatedFighters: string[];
}

export const TEAM_MIN_ROSTER = 8;
export const TEAM_MAX_ROSTER = 16;
export const TEAM_STARTING_BUDGET = 220;
