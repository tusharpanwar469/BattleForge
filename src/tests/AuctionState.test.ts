import { describe, expect, it } from "vitest";
import {
  AUCTION_MAX_BASE_PRICE,
  AUCTION_MAX_BID_INCREMENT,
  AUCTION_MIN_BASE_PRICE,
  AUCTION_MIN_BID_INCREMENT,
  AUCTION_RESPONSE_WINDOW_SECONDS,
  AUCTION_WARNING_SECONDS,
  type AuctionState
} from "../core/AuctionState";

describe("AuctionState", () => {
  it("stores the initial auction state correctly", () => {
    const auction: AuctionState = {
      fighterId: "iron-man",
      basePrice: 5,
      currentBid: null,
      highestBidderTeamId: null,
      remainingSeconds: AUCTION_RESPONSE_WINDOW_SECONDS,
      status: "waiting"
    };

    expect(auction.fighterId).toBe("iron-man");
    expect(auction.basePrice).toBe(5);
    expect(auction.currentBid).toBeNull();
    expect(auction.highestBidderTeamId).toBeNull();
    expect(auction.remainingSeconds).toBe(9);
    expect(auction.status).toBe("waiting");
  });

  it("defines the locked base-price range", () => {
    expect(AUCTION_MIN_BASE_PRICE).toBe(1);
    expect(AUCTION_MAX_BASE_PRICE).toBe(10);
  });

  it("defines the locked dynamic bid-increment range", () => {
    expect(AUCTION_MIN_BID_INCREMENT).toBe(1);
    expect(AUCTION_MAX_BID_INCREMENT).toBe(10);
  });

  it("defines the locked 9-second response window", () => {
    expect(AUCTION_RESPONSE_WINDOW_SECONDS).toBe(9);
  });

  it("defines the auction warning countdown points", () => {
    expect(AUCTION_WARNING_SECONDS).toEqual([9, 6, 3]);
  });
});