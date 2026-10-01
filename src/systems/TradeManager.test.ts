import { describe, expect, it } from "vitest";
import type { FighterDefinition } from "../core/FighterDefinition";
import { FighterRegistry } from "./FighterRegistry";
import { TeamRosterManager } from "./TeamRosterManager";
import { TradeManager } from "./TradeManager";
import type { TeamState } from "../core/TeamState";

function createFighter(
    id: string,
    name: string
): FighterDefinition {
    return {
        id,
        name,
        factors: {
            power: 50,
            durability: 50,
            speed: 50,
            intelligence: 50,
            combatSkill: 50,
            abilities: 50,
            equipment: 50,
            battlefield: 50,
            endurance: 50,
            teamwork: 50,
            magic: 50,
            technology: 50,
        },
        peakScreenState: "Test peak screen state",
        sources: ["Test source"],
        feats: ["Test feat"],
    };
}

function createTeam(
    id: string,
    name: string
): TeamState {
    return {
        id,
        name,
        budget: 220,
        roster: [],
        eliminatedFighters: [],
    };
}

function createTradeManager(): TradeManager {
    const registry = new FighterRegistry();

    registry.register(
        createFighter("fighter-a", "Fighter A")
    );

    registry.register(
        createFighter("fighter-b", "Fighter B")
    );

    const rosterManager =
        new TeamRosterManager(registry);

    return new TradeManager(
        registry,
        rosterManager
    );
}

describe("TradeManager", () => {
    it("successfully exchanges fighters between two confirmed teams", () => {
        const tradeManager =
            createTradeManager();

        const teamA =
            createTeam("A", "Team A");

        const teamB =
            createTeam("B", "Team B");

        teamA.roster.push("fighter-a");
        teamB.roster.push("fighter-b");

        const result =
            tradeManager.executeTrade({
                teamA,
                fighterAId: "fighter-a",
                teamB,
                fighterBId: "fighter-b",
                teamAConfirmed: true,
                teamBConfirmed: true,
            });

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);

        expect(teamA.roster).toContain("fighter-b");
        expect(teamA.roster).not.toContain("fighter-a");

        expect(teamB.roster).toContain("fighter-a");
        expect(teamB.roster).not.toContain("fighter-b");
    });

    it("rejects a trade when either team has not confirmed", () => {
        const tradeManager =
            createTradeManager();

        const teamA =
            createTeam("A", "Team A");

        const teamB =
            createTeam("B", "Team B");

        teamA.roster.push("fighter-a");
        teamB.roster.push("fighter-b");

        const result =
            tradeManager.executeTrade({
                teamA,
                fighterAId: "fighter-a",
                teamB,
                fighterBId: "fighter-b",
                teamAConfirmed: true,
                teamBConfirmed: false,
            });

        expect(result.success).toBe(false);
        expect(result.errors).toContain(
            "Team B must confirm the trade."
        );

        expect(teamA.roster).toContain("fighter-a");
        expect(teamB.roster).toContain("fighter-b");
    });

    it("rejects a trade involving an eliminated fighter", () => {
        const tradeManager =
            createTradeManager();

        const teamA =
            createTeam("A", "Team A");

        const teamB =
            createTeam("B", "Team B");

        teamA.roster.push("fighter-a");
        teamB.roster.push("fighter-b");

        teamA.eliminatedFighters.push(
            "fighter-a"
        );

        const result =
            tradeManager.executeTrade({
                teamA,
                fighterAId: "fighter-a",
                teamB,
                fighterBId: "fighter-b",
                teamAConfirmed: true,
                teamBConfirmed: true,
            });

        expect(result.success).toBe(false);
        expect(result.errors).toContain(
            'Fighter "fighter-a" is eliminated and cannot be traded.'
        );

        expect(teamA.roster).toContain("fighter-a");
        expect(teamB.roster).toContain("fighter-b");
    });
});