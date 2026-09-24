import type { AuctionState } from "../core/AuctionState";
import {
  AUCTION_MAX_BASE_PRICE,
  AUCTION_MIN_BASE_PRICE,
  AUCTION_RESPONSE_WINDOW_SECONDS
} from "../core/AuctionState";

export interface AuctionValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateAuctionState(
  auction: AuctionState
): AuctionValidationResult {
  const errors: string[] = [];

  if (!auction.fighterId.trim()) {
    errors.push("Auction fighter ID cannot be empty.");
  }

  if (
    auction.basePrice < AUCTION_MIN_BASE_PRICE ||
    auction.basePrice > AUCTION_MAX_BASE_PRICE
  ) {
    errors.push(
      `Auction base price must be between ${AUCTION_MIN_BASE_PRICE} and ${AUCTION_MAX_BASE_PRICE}.`
    );
  }

  if (
    auction.remainingSeconds < 0 ||
    auction.remainingSeconds > AUCTION_RESPONSE_WINDOW_SECONDS
  ) {
    errors.push(
      `Auction remaining seconds must be between 0 and ${AUCTION_RESPONSE_WINDOW_SECONDS}.`
    );
  }

  if (auction.currentBid !== null) {
    if (auction.currentBid < auction.basePrice) {
      errors.push("Current bid cannot be below the auction base price.");
    }

    if (!auction.highestBidderTeamId?.trim()) {
      errors.push("A current bid requires a highest bidder team.");
    }
  }

  if (auction.currentBid === null && auction.highestBidderTeamId !== null) {
    errors.push("A highest bidder requires a current bid.");
  }

  if (auction.status === "waiting" && auction.highestBidderTeamId !== null) {
    errors.push("Waiting auction cannot have a highest bidder.");
  }

  if (auction.status === "sold") {
    if (auction.currentBid === null || auction.highestBidderTeamId === null) {
      errors.push("Sold auction must have a current bid and winning bidder.");
    }
  }

  if (auction.status === "unsold") {
    if (
      auction.currentBid !== null ||
      auction.highestBidderTeamId !== null
    ) {
      errors.push("Unsold auction cannot have a current bid or bidder.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
