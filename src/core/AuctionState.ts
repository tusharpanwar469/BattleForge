export type AuctionStatus =
  | "waiting"
  | "active"
  | "sold"
  | "unsold";

export interface AuctionState {
  fighterId: string;
  basePrice: number;
  currentBid: number | null;
  highestBidderTeamId: string | null;
  remainingSeconds: number;
  status: AuctionStatus;
}

export const AUCTION_MIN_BASE_PRICE = 1;
export const AUCTION_MAX_BASE_PRICE = 10;

export const AUCTION_MIN_BID_INCREMENT = 1;
export const AUCTION_MAX_BID_INCREMENT = 10;

export const AUCTION_RESPONSE_WINDOW_SECONDS = 9;

export const AUCTION_WARNING_SECONDS = [9, 6, 3] as const;