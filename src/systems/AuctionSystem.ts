import type { TeamState } from "../core/TeamState";
import type { AuctionFighter } from "../data/AuctionFighters";

export class AuctionSystem {
    private currentBid: number;
    private highestBidderId: string | null;
    private reservedBids: Map<string, number>;
    private auctionSeconds: number;
    private confirmationRequested: boolean;
    private confirmedTeamIds: Set<string>;
    private saleConfirmed: boolean;
    private currentFighter: AuctionFighter | null;


    constructor(basePrice: number) {
        this.currentBid = basePrice;
        this.highestBidderId = null;
        this.reservedBids = new Map();
        this.auctionSeconds = 9;
        this.confirmationRequested = false;
        this.confirmedTeamIds = new Set();
        this.saleConfirmed = false;
        this.currentFighter = null;
    }

    getCurrentBid(): number {
        return this.currentBid;
    }

    getHighestBidderId(): string | null {
        return this.highestBidderId;
    }

    getRemainingBudget(team: TeamState): number {
       const reservedBid = this.reservedBids.get(team.id) ?? 0;

       return team.budget - reservedBid;
    }

   placeBid(team: TeamState, increment: number): boolean {
    if (this.isAuctionExpired()) {
        return false;
    }

    if (this.saleConfirmed) {
        return false;
    }

    const allowedIncrements = [1, 2, 5, 10];

    if (!allowedIncrements.includes(increment)) {
        return false;
    }

    if (this.highestBidderId === team.id) {
        return false;
    }

    const newBid = this.currentBid + increment;
    const remainingBudget = this.getRemainingBudget(team);

    if (newBid > team.budget) {
        return false;
    }

    if (newBid > remainingBudget + this.currentBid) {
        return false;
    }

    if (this.highestBidderId !== null) {
        this.reservedBids.delete(this.highestBidderId);
    }

    this.currentBid = newBid;
    this.highestBidderId = team.id;
    this.reservedBids.set(team.id, newBid);
    this.resetAuctionTimer();
    this.confirmationRequested = false;
    this.confirmedTeamIds.clear();

    return true;
    }

    finalizeSale(team: TeamState): boolean {
    if (this.highestBidderId !== team.id) {
        return false;
    }

    if (this.currentBid > team.budget) {
        return false;
    }

    team.budget -= this.currentBid;

    this.reservedBids.delete(team.id);

    return true;
    }

    getAuctionSeconds(): number {
       return this.auctionSeconds;
    }

    resetAuctionTimer(): void {
       this.auctionSeconds = 9;
    }

    tickAuctionTimer(): number {
        if (this.auctionSeconds > 0) {
             this.auctionSeconds--;
    }

        return this.auctionSeconds;
    }

    isAuctionExpired(): boolean {
        return this.auctionSeconds === 0;
    }

    requestConfirmation(teamId: string): boolean {
    if (this.isAuctionExpired()) {
        return false;
    }

    if (this.saleConfirmed) {
        return false;
    }

    if (this.highestBidderId !== teamId) {
        return false;
    }

    this.confirmationRequested = true;
    this.confirmedTeamIds.clear();

    return true;
}

confirmSale(teamId: string): boolean {
    if (this.isAuctionExpired()) {
        return false;
    }

    if (this.saleConfirmed) {
        return false;
    }

    if (!this.confirmationRequested) {
        return false;
    }

    if (this.highestBidderId === teamId) {
        return false;
    }

    if (this.confirmedTeamIds.has(teamId)) {
        return false;
    }

    this.confirmedTeamIds.add(teamId);

    if (this.confirmedTeamIds.size === 3) {
        this.saleConfirmed = true;
        this.confirmationRequested = false;
    }

        return true;
    }

    reset(basePrice: number): void {
    this.currentBid = basePrice;
    this.highestBidderId = null;
    this.reservedBids.clear();
    this.auctionSeconds = 9;
    this.confirmationRequested = false;
    this.confirmedTeamIds.clear();
    this.saleConfirmed = false;
    }

    setCurrentFighter(fighter: AuctionFighter): void {
    this.currentFighter = fighter;
    this.currentBid = fighter.basePrice;
    this.highestBidderId = null;
    this.reservedBids.clear();
    this.resetAuctionTimer();

    this.confirmationRequested = false;
    this.confirmedTeamIds.clear();
    this.saleConfirmed = false;
    }

    getCurrentFighter(): AuctionFighter | null {
        return this.currentFighter;
    }

    getAuctionOutcome(): "SOLD" | "UNSOLD" | null {
    if (this.saleConfirmed) {
        return "SOLD";
    }

    if (!this.isAuctionExpired()) {
        return null;
    }

    if (this.highestBidderId !== null) {
        return "SOLD";
    }

        return "UNSOLD";
    }
}