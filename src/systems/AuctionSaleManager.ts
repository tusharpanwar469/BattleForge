import type { AuctionState } from "../core/AuctionState";
import type { TeamState } from "../core/TeamState";
import { validateAuctionState } from "./AuctionStateValidator";
import { TeamRosterManager } from "./TeamRosterManager";

export interface AuctionSaleResult {
    success: boolean;
    finalPrice?: number;
    errors: string[];
}

export class AuctionSaleManager {
    constructor(
        private readonly rosterManager: TeamRosterManager
    ) {}

    settleSale(
        auction: AuctionState,
        team: TeamState
    ): AuctionSaleResult {
        const auctionValidation =
            validateAuctionState(auction);

        if (!auctionValidation.isValid) {
            return {
                success: false,
                errors: auctionValidation.errors,
            };
        }

        if (auction.status !== "sold") {
            return {
                success: false,
                errors: [
                    "Only a sold auction can be settled.",
                ],
            };
        }

        if (
            auction.highestBidderTeamId !== team.id
        ) {
            return {
                success: false,
                errors: [
                    `Winning bidder "${auction.highestBidderTeamId}" does not match team "${team.id}".`,
                ],
            };
        }

        const finalPrice = auction.currentBid;

        if (finalPrice === null) {
            return {
                success: false,
                errors: [
                    "Sold auction must have a final bid.",
                ],
            };
        }

        if (finalPrice > team.budget) {
            return {
                success: false,
                errors: [
                    "Team cannot afford the final auction price.",
                ],
            };
        }

        const rosterResult =
            this.rosterManager.addFighter(
                team,
                auction.fighterId
            );

        if (!rosterResult.success) {
            return {
                success: false,
                errors: rosterResult.errors,
            };
        }

        /*
         * Budget is deducted only after the fighter
         * has been successfully added to the roster.
         */
        team.budget -= finalPrice;

        return {
            success: true,
            finalPrice,
            errors: [],
        };
    }
}