import type { TeamState } from "../core/TeamState";
import type { FighterRegistry } from "./FighterRegistry";
import { TeamRosterManager } from "./TeamRosterManager";

export interface TradeRequest {
    teamA: TeamState;
    fighterAId: string;
    teamB: TeamState;
    fighterBId: string;
    teamAConfirmed: boolean;
    teamBConfirmed: boolean;
}

export interface TradeOperationResult {
    success: boolean;
    errors: string[];
}

export class TradeManager {
    constructor(
        private readonly registry: FighterRegistry,
        private readonly rosterManager: TeamRosterManager
    ) {}

    executeTrade(
        request: TradeRequest
    ): TradeOperationResult {
        const validationErrors =
            this.validateTrade(request);

        if (validationErrors.length > 0) {
            return {
                success: false,
                errors: validationErrors,
            };
        }

        const fighterAId =
            request.fighterAId.trim().toLowerCase();

        const fighterBId =
            request.fighterBId.trim().toLowerCase();

        const removeA =
            this.rosterManager.removeFighter(
                request.teamA,
                fighterAId
            );

        if (!removeA.success) {
            return {
                success: false,
                errors: removeA.errors,
            };
        }

        const removeB =
            this.rosterManager.removeFighter(
                request.teamB,
                fighterBId
            );

        if (!removeB.success) {
            this.rosterManager.addFighter(
                request.teamA,
                fighterAId
            );

            return {
                success: false,
                errors: removeB.errors,
            };
        }

        const addToA =
            this.rosterManager.addFighter(
                request.teamA,
                fighterBId
            );

        if (!addToA.success) {
            this.rosterManager.addFighter(
                request.teamA,
                fighterAId
            );

            this.rosterManager.addFighter(
                request.teamB,
                fighterBId
            );

            return {
                success: false,
                errors: addToA.errors,
            };
        }

        const addToB =
            this.rosterManager.addFighter(
                request.teamB,
                fighterAId
            );

        if (!addToB.success) {
            this.rosterManager.removeFighter(
                request.teamA,
                fighterBId
            );

            this.rosterManager.addFighter(
                request.teamA,
                fighterAId
            );

            this.rosterManager.addFighter(
                request.teamB,
                fighterBId
            );

            return {
                success: false,
                errors: addToB.errors,
            };
        }

        return {
            success: true,
            errors: [],
        };
    }

    private validateTrade(
        request: TradeRequest
    ): string[] {
        const errors: string[] = [];

        if (request.teamA.id === request.teamB.id) {
            errors.push(
                "A team cannot trade with itself."
            );
        }

        if (!request.teamAConfirmed) {
            errors.push(
                "Team A must confirm the trade."
            );
        }

        if (!request.teamBConfirmed) {
            errors.push(
                "Team B must confirm the trade."
            );
        }

        const fighterAId =
            request.fighterAId.trim().toLowerCase();

        const fighterBId =
            request.fighterBId.trim().toLowerCase();

        if (!fighterAId) {
            errors.push(
                "Team A fighter ID cannot be empty."
            );
        }

        if (!fighterBId) {
            errors.push(
                "Team B fighter ID cannot be empty."
            );
        }

        if (
            fighterAId &&
            !this.registry.has(fighterAId)
        ) {
            errors.push(
                `Fighter "${request.fighterAId}" is not registered.`
            );
        }

        if (
            fighterBId &&
            !this.registry.has(fighterBId)
        ) {
            errors.push(
                `Fighter "${request.fighterBId}" is not registered.`
            );
        }

        if (
            fighterAId &&
            !request.teamA.roster.some(
                (id) =>
                    id.toLowerCase() === fighterAId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterAId}" does not belong to Team A.`
            );
        }

        if (
            fighterBId &&
            !request.teamB.roster.some(
                (id) =>
                    id.toLowerCase() === fighterBId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterBId}" does not belong to Team B.`
            );
        }

        if (
            fighterAId &&
            request.teamA.eliminatedFighters.some(
                (id) =>
                    id.toLowerCase() === fighterAId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterAId}" is eliminated and cannot be traded.`
            );
        }

        if (
            fighterBId &&
            request.teamB.eliminatedFighters.some(
                (id) =>
                    id.toLowerCase() === fighterBId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterBId}" is eliminated and cannot be traded.`
            );
        }

        if (
            fighterBId &&
            request.teamA.roster.some(
                (id) =>
                    id.toLowerCase() === fighterBId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterBId}" is already owned by Team A.`
            );
        }

        if (
            fighterAId &&
            request.teamB.roster.some(
                (id) =>
                    id.toLowerCase() === fighterAId
            )
        ) {
            errors.push(
                `Fighter "${request.fighterAId}" is already owned by Team B.`
            );
        }

        return errors;
    }
}