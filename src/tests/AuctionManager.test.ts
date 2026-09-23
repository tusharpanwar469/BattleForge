import { describe, expect, it } from "vitest";
import type { AuctionState } from "../core/AuctionState";
import { AuctionManager } from "../systems/AuctionManager";
import type { TeamState } from "../core/TeamState";

const createAuction = (
  overrides: Partial<AuctionState> = {}
): AuctionState => ({
  fighterId: "iron-man",
  basePrice: 5,
  currentBid: null,
  highestBidderTeamId: null,
  remainingSeconds: 9,
  status: "waiting",
  ...overrides
});

const createTeam = (
  id = "team-a",
  budget = 220
): TeamState => ({
  id,
  name: id,
  budget,
  roster: [],
  eliminatedFighters: []
});

describe("AuctionManager", () => {
  it("starts a waiting auction and activates it with 9 seconds", () => {
    const manager = new AuctionManager();

    const result = manager.startAuction(createAuction());

    expect(result.success).toBe(true);
    expect(result.auction).toEqual({
      fighterId: "iron-man",
      basePrice: 5,
      currentBid: null,
      highestBidderTeamId: null,
      remainingSeconds: 9,
      status: "active"
    });
  });

  it("accepts the first bid at the base price", () => {
    const manager = new AuctionManager();
    const auction = createAuction({
      status: "active"
    });

    const result = manager.placeBid(
      auction,
      createTeam("team-a"),
      5
    );

    expect(result.success).toBe(true);
    expect(result.auction?.currentBid).toBe(5);
    expect(result.auction?.highestBidderTeamId).toBe("team-a");
    expect(result.auction?.remainingSeconds).toBe(9);
  });

  it("uses the selected dynamic increment for a later bid", () => {
    const manager = new AuctionManager();

    const auction = createAuction({
      status: "active",
      currentBid: 5,
      highestBidderTeamId: "team-a",
      remainingSeconds: 3
    });

    const result = manager.placeBid(
      auction,
      createTeam("team-b"),
      7
    );

    expect(result.success).toBe(true);
    expect(result.auction?.currentBid).toBe(12);
    expect(result.auction?.highestBidderTeamId).toBe("team-b");
    expect(result.auction?.remainingSeconds).toBe(9);
  });

  it("rejects a bid increment below 1", () => {
    const manager = new AuctionManager();

    const result = manager.placeBid(
      createAuction({ status: "active" }),
      createTeam(),
      0
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Bid increment must be between 1 and 10."
    );
  });

  it("rejects a bid increment above 10", () => {
    const manager = new AuctionManager();

    const result = manager.placeBid(
      createAuction({ status: "active" }),
      createTeam(),
      11
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Bid increment must be between 1 and 10."
    );
  });

  it("rejects a bid when the team cannot afford it", () => {
    const manager = new AuctionManager();

    const auction = createAuction({
      status: "active",
      currentBid: 215,
      highestBidderTeamId: "team-b"
    });

    const result = manager.placeBid(
      auction,
      createTeam("team-a", 220),
      6
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Team cannot afford the bid.");
  });

  it("rejects bids on a non-active auction", () => {
    const manager = new AuctionManager();

    const result = manager.placeBid(
      createAuction({ status: "waiting" }),
      createTeam(),
      5
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Bids can only be placed on an active auction."
    );
  });

  it("resets the response window to 9 seconds after every valid bid", () => {
    const manager = new AuctionManager();

    const auction = createAuction({
      status: "active",
      currentBid: 8,
      highestBidderTeamId: "team-a",
      remainingSeconds: 1
    });

    const result = manager.placeBid(
      auction,
      createTeam("team-b"),
      2
    );

    expect(result.success).toBe(true);
    expect(result.auction?.currentBid).toBe(10);
    expect(result.auction?.remainingSeconds).toBe(9);
  });

  it("reduces the active auction timer", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "active",
        remainingSeconds: 9
      }),
      3
    );

    expect(result.success).toBe(true);
    expect(result.auction?.remainingSeconds).toBe(6);
    expect(result.auction?.status).toBe("active");
  });

  it("resolves an active auction as sold when the timer reaches zero with a bid", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "active",
        currentBid: 15,
        highestBidderTeamId: "team-a",
        remainingSeconds: 3
      }),
      3
    );

    expect(result.success).toBe(true);
    expect(result.auction?.remainingSeconds).toBe(0);
    expect(result.auction?.status).toBe("sold");
    expect(result.auction?.highestBidderTeamId).toBe("team-a");
    expect(result.auction?.currentBid).toBe(15);
  });

  it("resolves an active auction as unsold when the timer reaches zero without a bid", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "active",
        currentBid: null,
        highestBidderTeamId: null,
        remainingSeconds: 2
      }),
      2
    );

    expect(result.success).toBe(true);
    expect(result.auction?.remainingSeconds).toBe(0);
    expect(result.auction?.status).toBe("unsold");
  });

  it("does not allow the timer to go below zero", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "active",
        remainingSeconds: 2
      }),
      10
    );

    expect(result.success).toBe(true);
    expect(result.auction?.remainingSeconds).toBe(0);
    expect(result.auction?.status).toBe("unsold");
  });

  it("rejects timer advancement on a non-active auction", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "waiting",
        remainingSeconds: 9
      }),
      1
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Only an active auction can advance its timer."
    );
  });

  it("rejects a non-positive timer step", () => {
    const manager = new AuctionManager();

    const result = manager.tick(
      createAuction({
        status: "active"
      }),
      0
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Tick seconds must be greater than zero."
    );
  });
});