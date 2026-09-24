import type { TeamState } from "../core/TeamState";
import { TEAM_STARTING_BUDGET } from "../core/TeamState";

export class TeamManager {
    private teams: TeamState[] = [];

    createTeams(teamNames: string[]): void {
        if (teamNames.length !== 4) {
            throw new Error(
                "BattleForge requires exactly 4 teams."
            );
        }

        this.teams = teamNames.map((name, index) => ({
            id: String.fromCharCode(65 + index),
            name,
            budget: TEAM_STARTING_BUDGET,
            roster: [],
            eliminatedFighters: [],
        }));
    }

    /**
     * Returns the authoritative runtime team states.
     *
     * Systems that perform approved state mutations must operate
     * on these TeamState objects through their designated managers.
     */
    getTeams(): TeamState[] {
        return this.teams;
    }

    /**
     * Returns the authoritative runtime TeamState for the given ID.
     */
    getTeam(id: string): TeamState | undefined {
        return this.teams.find(
            (team) => team.id === id
        );
    }

    reset(): void {
        this.teams = [];
    }
}