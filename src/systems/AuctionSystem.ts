import type { TeamState } from "../core/TeamState";

export class AuctionSystem {
    private currentBid: number;
    private highestBidderId: string | null;

    constructor(basePrice: number) {
        this.currentBid = basePrice;
        this.highestBidderId = null;
    }

    getCurrentBid(): number {
        return this.currentBid;
    }

    getHighestBidderId(): string | null {
        return this.highestBidderId;
    }

    placeBid(team: TeamState, increment: number): boolean {
        const newBid = this.currentBid + increment;

        if (newBid > team.budget) {
            return false;
        }

        this.currentBid = newBid;
        this.highestBidderId = team.id;

        return true;
    }

    reset(basePrice: number): void {
        this.currentBid = basePrice;
        this.highestBidderId = null;
    }
}