import { describe, expect, it } from "vitest";
import type { AuctionState } from "../core/AuctionState";
import type { FighterDefinition } from "../core/FighterDefinition";
import type { TeamState } from "../core/TeamState";
import { AuctionSaleManager } from "../systems/AuctionSaleManager";
import { FighterRegistry } from "../systems/FighterRegistry";
import { TeamRosterManager } from "../systems/TeamRosterManager";

const createFighter = (id: string): FighterDefinition => ({
  id,
  name: id,
  factors: {
    power: 1,
    durability: 1,
    speed: 1,
    intelligence: 1,
    combatSkill: 1,
    abilities: 1,
    equipment: 1,
    battlefield: 1,
    endurance: 1,
    teamwork: 1,
    magic: 1,
    technology: 1
  },
  peakScreenState: "peak",
  sources: ["test"],
  feats: ["test"]
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

const createRegistry = (): FighterRegistry => {
  const registry = new FighterRegistry();

  registry.register(createFighter("iron-man"));

  return registry;
};

const createAuction = (
  overrides: Partial<AuctionState> = {}
): AuctionState => ({
  fighterId: "iron-man",
  basePrice: 5,
  currentBid: 20,
  highestBidderTeamId: "team-a",
  remainingSeconds: 0,
  status: "sold",
  ...overrides
});

const createManager = (): AuctionSaleManager => {
  const registry = createRegistry();
  const rosterManager = new TeamRosterManager(registry);

  return new AuctionSaleManager(rosterManager);
};

describe("AuctionSaleManager", () => {
  it("settles a sold auction and updates the team", () => {
    const manager = createManager();
    const team = createTeam("team-a", 220);

    const result = manager.settleSale(
      createAuction({
        currentBid: 20,
        highestBidderTeamId: "team-a"
      }),
      team
    );

    expect(result.success).toBe(true);
    expect(result.finalPrice).toBe(20);
    expect(team.budget).toBe(200);
    expect(team.roster).toEqual(["iron-man"]);
  });

  it("rejects an auction that is not sold", () => {
    const manager = createManager();
    const team = createTeam();

    const result = manager.settleSale(
      createAuction({
        status: "active"
      }),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Only a sold auction can be settled."
    );
    expect(team.budget).toBe(220);
    expect(team.roster).toEqual([]);
  });

  it("rejects settlement for the wrong winning team", () => {
    const manager = createManager();
    const team = createTeam("team-b");

    const result = manager.settleSale(
      createAuction({
        highestBidderTeamId: "team-a"
      }),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(team.budget).toBe(220);
    expect(team.roster).toEqual([]);
  });

  it("rejects a sold auction without a final bid", () => {
    const manager = createManager();
    const team = createTeam();

    const result = manager.settleSale(
      createAuction({
        currentBid: null
      }),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(team.budget).toBe(220);
    expect(team.roster).toEqual([]);
  });

  it("rejects a team that cannot afford the final price", () => {
    const manager = createManager();
    const team = createTeam("team-a", 10);

    const result = manager.settleSale(
      createAuction({
        currentBid: 20
      }),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      "Team cannot afford the final auction price."
    );
    expect(team.budget).toBe(10);
    expect(team.roster).toEqual([]);
  });

  it("does not deduct the budget when roster insertion fails", () => {
    const manager = createManager();
    const team = createTeam("team-a", 220);

    team.roster.push("iron-man");

    const result = manager.settleSale(
      createAuction(),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(team.budget).toBe(220);
    expect(team.roster).toEqual(["iron-man"]);
  });

  it("does not settle an auction with an invalid state", () => {
    const manager = createManager();
    const team = createTeam();

    const result = manager.settleSale(
      createAuction({
        basePrice: 11
      }),
      team
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(team.budget).toBe(220);
    expect(team.roster).toEqual([]);
  });

  it("deducts exactly the final auction price", () => {
    const manager = createManager();
    const team = createTeam("team-a", 100);

    const result = manager.settleSale(
      createAuction({
        currentBid: 37
      }),
      team
    );

    expect(result.success).toBe(true);
    expect(result.finalPrice).toBe(37);
    expect(team.budget).toBe(63);
    expect(team.roster).toContain("iron-man");
  });
});