import type { TeamState } from "../core/TeamState";

export class TeamManager {
    private teams: TeamState[] = [];

    createTeams(teamNames: string[]): void {
        if (teamNames.length !== 4) {
            throw new Error("BattleForge requires exactly 4 teams.");
        }

        this.teams = teamNames.map((name, index) => ({
            id: String.fromCharCode(65 + index),
            name,
            budget: 220,
            roster: [],
            eliminatedFighters: [],
        }));
    }

    getTeams(): TeamState[] {
        return this.teams.map((team) => ({
            ...team,
            roster: [...team.roster],
            eliminatedFighters: [...team.eliminatedFighters],
        }));
    }

    getTeam(id: string): TeamState | undefined {
        const team = this.teams.find((team) => team.id === id);

        if (!team) {
            return undefined;
        }

        return {
            ...team,
            roster: [...team.roster],
            eliminatedFighters: [...team.eliminatedFighters],
        };
    }
    addFighterToRoster(teamId: string, fighterId: string): boolean {
    const team = this.teams.find((team) => team.id === teamId);

    if (!team) {
        return false;
    }

    if (team.roster.length >= 16) {
        return false;
    }

    if (team.roster.includes(fighterId)) {
        return false;
    }

    team.roster.push(fighterId);

    return true;
    }

    reset(): void {
        this.teams = [];
    }
}