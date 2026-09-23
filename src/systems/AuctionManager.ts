import type { AuctionState } from "../core/AuctionState";
import {
  AUCTION_MAX_BID_INCREMENT,
  AUCTION_MIN_BID_INCREMENT,
  AUCTION_RESPONSE_WINDOW_SECONDS
} from "../core/AuctionState";
import type { TeamState } from "../core/TeamState";
import { validateAuctionState } from "./AuctionStateValidator";

export interface AuctionOperationResult {
  success: boolean;
  auction?: AuctionState;
  errors: string[];
}

export class AuctionManager {
  startAuction(
    auction: AuctionState
  ): AuctionOperationResult {
    const nextAuction: AuctionState = {
      ...auction,
      status: "active",
      remainingSeconds: AUCTION_RESPONSE_WINDOW_SECONDS
    };

    const validation = validateAuctionState(nextAuction);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    return {
      success: true,
      auction: nextAuction,
      errors: []
    };
  }

  placeBid(
    auction: AuctionState,
    team: TeamState,
    bidIncrement: number
  ): AuctionOperationResult {
    const errors: string[] = [];

    if (auction.status !== "active") {
      errors.push("Bids can only be placed on an active auction.");
    }

    if (
      bidIncrement < AUCTION_MIN_BID_INCREMENT ||
      bidIncrement > AUCTION_MAX_BID_INCREMENT
    ) {
      errors.push(
        `Bid increment must be between ${AUCTION_MIN_BID_INCREMENT} and ${AUCTION_MAX_BID_INCREMENT}.`
      );
    }

    const minimumBid =
      auction.currentBid === null
        ? auction.basePrice
        : auction.currentBid + bidIncrement;

    if (
      auction.currentBid !== null &&
      bidIncrement >= AUCTION_MIN_BID_INCREMENT &&
      bidIncrement <= AUCTION_MAX_BID_INCREMENT &&
      auction.currentBid + bidIncrement > team.budget
    ) {
      errors.push("Team cannot afford the bid.");
    }

    if (
      auction.currentBid === null &&
      auction.basePrice > team.budget
    ) {
      errors.push("Team cannot afford the base price.");
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    const nextAuction: AuctionState = {
      ...auction,
      currentBid: minimumBid,
      highestBidderTeamId: team.id,
      remainingSeconds: AUCTION_RESPONSE_WINDOW_SECONDS
    };

    const validation = validateAuctionState(nextAuction);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    return {
      success: true,
      auction: nextAuction,
      errors: []
    };
  }

  tick(
    auction: AuctionState,
    seconds = 1
  ): AuctionOperationResult {
    if (seconds <= 0) {
      return {
        success: false,
        errors: ["Tick seconds must be greater than zero."]
      };
    }

    if (auction.status !== "active") {
      return {
        success: false,
        errors: ["Only an active auction can advance its timer."]
      };
    }

    const remainingSeconds = Math.max(
      0,
      auction.remainingSeconds - seconds
    );

    const nextAuction: AuctionState = {
      ...auction,
      remainingSeconds
    };

    if (remainingSeconds === 0) {
      nextAuction.status =
        nextAuction.currentBid === null
          ? "unsold"
          : "sold";
    }

    const validation = validateAuctionState(nextAuction);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    return {
      success: true,
      auction: nextAuction,
      errors: []
    };
  }
}