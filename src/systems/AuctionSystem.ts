import type { TeamState } from "../core/TeamState";
import type { AuctionFighter } from "../data/AuctionFighters";
import type { AuctionState } from "../core/AuctionState";

export class AuctionSystem {
    private currentBid: number | null;
    private highestBidderId: string | null;
    private reservedBids: Map<string, number>;
    private auctionSeconds: number;
    private confirmationRequested: boolean;
    private confirmedTeamIds: Set<string>;
    private saleConfirmed: boolean;
    private currentFighter: AuctionFighter | null;

    constructor(basePrice: number) {
        if (basePrice < 1 || basePrice > 10) {
            throw new Error(
                "Auction base price must be between 1 and 10."
            );
        }

        this.currentBid = null;
        this.highestBidderId = null;
        this.reservedBids = new Map();
        this.auctionSeconds = 9;
        this.confirmationRequested = false;
        this.confirmedTeamIds = new Set();
        this.saleConfirmed = false;
        this.currentFighter = null;
    }

    getCurrentBid(): number {
        return this.currentBid ?? this.getBasePrice();
    }

    getHighestBidderId(): string | null {
        return this.highestBidderId;
    }

    getRemainingBudget(team: TeamState): number {
        const reservedBid =
            this.reservedBids.get(team.id) ?? 0;

        return team.budget - reservedBid;
    }

    /**
     * Clears the temporary auction reservation for a team.
     *
     * This must be called only after a successful sale
     * settlement, because AuctionSaleManager has already
     * deducted the final price from the authoritative budget.
     */
    clearReservation(teamId: string): void {
        this.reservedBids.delete(teamId);
    }

    placeBid(
        team: TeamState,
        increment: number
    ): boolean {
        if (this.isAuctionExpired()) {
            return false;
        }

        if (this.saleConfirmed) {
            return false;
        }

        const allowedIncrements = [
            1,
            2,
            5,
        ];

        if (
            !allowedIncrements.includes(
                increment
            )
        ) {
            return false;
        }

        if (
            this.highestBidderId ===
            team.id
        ) {
            return false;
        }

        const currentAuctionPrice =
            this.currentBid ??
            this.getBasePrice();

        const newBid =
            currentAuctionPrice +
            increment;

        const existingReservation =
            this.reservedBids.get(
                team.id
            ) ?? 0;

        const availableBudget =
            team.budget -
            existingReservation;

        if (
            newBid >
            availableBudget
        ) {
            return false;
        }

        if (
            this.highestBidderId !==
            null
        ) {
            this.reservedBids.delete(
                this.highestBidderId
            );
        }

        this.currentBid = newBid;
        this.highestBidderId =
            team.id;

        this.reservedBids.set(
            team.id,
            newBid
        );

        this.resetAuctionTimer();

        this.confirmationRequested =
            false;

        this.confirmedTeamIds.clear();

        return true;
    }

    placeOpeningBid(team: TeamState): boolean {
    if (this.isAuctionExpired()) {
        return false;
    }

    if (
        this.saleConfirmed ||
        this.currentBid !== null ||
        this.highestBidderId !== null
    ) {
        return false;
    }

    const basePrice = this.getBasePrice();

    const existingReservation =
        this.reservedBids.get(team.id) ?? 0;

    const availableBudget =
        team.budget - existingReservation;

    if (basePrice > availableBudget) {
        return false;
    }

    this.currentBid = basePrice;
    this.highestBidderId = team.id;

    this.reservedBids.set(team.id, basePrice);

    this.resetAuctionTimer();

    this.confirmationRequested = false;
    this.confirmedTeamIds.clear();

    return true;
    }

    /**
     * AuctionSystem determines the auction outcome.
     * Actual sale settlement belongs to AuctionSaleManager.
     */
    finalizeSale(): boolean {
    return (
        this.getAuctionOutcome() ===
        "SOLD"
        );
    }

    getAuctionSeconds(): number {
        return this.auctionSeconds;
    }

    resetAuctionTimer(): void {
        this.auctionSeconds = 9;
    }

    tickAuctionTimer(): number {
        if (
            this.auctionSeconds > 0
        ) {
            this.auctionSeconds--;
        }

        return this.auctionSeconds;
    }

    isAuctionExpired(): boolean {
        return (
            this.auctionSeconds === 0
        );
    }

    requestConfirmation(
        teamId: string
    ): boolean {
        if (
            this.isAuctionExpired()
        ) {
            return false;
        }

        if (this.saleConfirmed) {
            return false;
        }

        if (
            this.highestBidderId !==
            teamId
        ) {
            return false;
        }

        this.confirmationRequested =
            true;

        this.confirmedTeamIds.clear();

        return true;
    }

    confirmSale(
        teamId: string
    ): boolean {
        if (
            this.isAuctionExpired()
        ) {
            return false;
        }

        if (this.saleConfirmed) {
            return false;
        }

        if (
            !this.confirmationRequested
        ) {
            return false;
        }

        if (
            this.highestBidderId ===
            teamId
        ) {
            return false;
        }

        if (
            this.confirmedTeamIds.has(
                teamId
            )
        ) {
            return false;
        }

        this.confirmedTeamIds.add(
            teamId
        );

        if (
            this.confirmedTeamIds.size ===
            3
        ) {
            this.saleConfirmed =
                true;

            this.confirmationRequested =
                false;
        }

        return true;
    }

    reset(
        basePrice: number
    ): void {
        if (
            basePrice < 1 ||
            basePrice > 10
        ) {
            throw new Error(
                "Auction base price must be between 1 and 10."
            );
        }

        this.currentBid = null;
        this.highestBidderId = null;
        this.reservedBids.clear();
        this.auctionSeconds = 9;
        this.confirmationRequested =
            false;
        this.confirmedTeamIds.clear();
        this.saleConfirmed = false;
    }

    setCurrentFighter(
        fighter: AuctionFighter
    ): void {
        this.currentFighter =
            fighter;

        this.currentBid = null;
        this.highestBidderId = null;
        this.reservedBids.clear();
        this.auctionSeconds = 9;

        this.confirmationRequested =
            false;

        this.confirmedTeamIds.clear();

        this.saleConfirmed = false;
    }

    getCurrentFighter():
        AuctionFighter | null {
        return this.currentFighter;
    }

    getState(): AuctionState {
        if (
            this.currentFighter ===
            null
        ) {
            throw new Error(
                "Cannot create AuctionState without a current fighter."
            );
        }

        return {
            fighterId:
                this.currentFighter.id,

            basePrice:
                this.currentFighter.basePrice,

            currentBid:
                this.currentBid,

            highestBidderTeamId:
                this.highestBidderId,

            remainingSeconds:
                this.auctionSeconds,

            status:
                this.getAuctionStatus(),
        };
    }

    getAuctionStatus():
        AuctionState["status"] {
        if (
            this.saleConfirmed
        ) {
            return "sold";
        }

        if (
            this.isAuctionExpired()
        ) {
            return (
                this.highestBidderId !==
                null
                    ? "sold"
                    : "unsold"
            );
        }

        if (
            this.currentBid ===
            null
        ) {
            return "waiting";
        }

        return "active";
    }

    getAuctionOutcome():
        | "SOLD"
        | "UNSOLD"
        | null {
        const status =
            this.getAuctionStatus();

        if (
            status === "sold"
        ) {
            return "SOLD";
        }

        if (
            status === "unsold"
        ) {
            return "UNSOLD";
        }

        return null;
    }

    private getBasePrice(): number {
        if (
            this.currentFighter !==
            null
        ) {
            return this.currentFighter
                .basePrice;
        }

        return (
            this.currentBid ?? 0
        );
    }
}