import { describe, expect, it } from "vitest";
import {
  AUCTION_RESPONSE_WINDOW_SECONDS
} from "../core/AuctionState";
import {
  validateAuctionState
} from "../systems/AuctionStateValidator";
import type { AuctionState } from "../core/AuctionState";

const createAuction = (
  overrides: Partial<AuctionState> = {}
): AuctionState => ({
  fighterId: "iron-man",
  basePrice: 5,
  currentBid: null,
  highestBidderTeamId: null,
  remainingSeconds: AUCTION_RESPONSE_WINDOW_SECONDS,
  status: "waiting",
  ...overrides
});

describe("AuctionStateValidator", () => {
  it("accepts a valid waiting auction", () => {
    expect(validateAuctionState(createAuction()).isValid).toBe(true);
  });

  it("rejects an empty fighter ID", () => {
    const result = validateAuctionState(
      createAuction({ fighterId: "   " })
    );

    expect(result.isValid).toBe(false);
  });

  it("rejects a base price outside the locked range", () => {
    const result = validateAuctionState(
      createAuction({ basePrice: 11 })
    );

    expect(result.isValid).toBe(false);
  });

  it("rejects remaining time outside the 9-second window", () => {
    const result = validateAuctionState(
      createAuction({ remainingSeconds: 10 })
    );

    expect(result.isValid).toBe(false);
  });

  it("requires a bidder when a current bid exists", () => {
    const result = validateAuctionState(
      createAuction({
        status: "active",
        currentBid: 7,
        highestBidderTeamId: null
      })
    );

    expect(result.isValid).toBe(false);
  });

  it("rejects a bid below the base price", () => {
    const result = validateAuctionState(
      createAuction({
        status: "active",
        currentBid: 4,
        highestBidderTeamId: "team-a"
      })
    );

    expect(result.isValid).toBe(false);
  });

  it("rejects an unsold auction with a bidder", () => {
    const result = validateAuctionState(
      createAuction({
        status: "unsold",
        currentBid: 5,
        highestBidderTeamId: "team-a"
      })
    );

    expect(result.isValid).toBe(false);
  });
});
