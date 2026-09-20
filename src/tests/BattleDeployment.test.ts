import { describe, expect, it } from "vitest";
import type { BattleDeployment } from "../core/BattleDeployment";

describe("BattleDeployment", () => {
  it("stores the team and deployed fighter IDs", () => {
    const deployment: BattleDeployment = {
      teamId: "team-a",
      fighterIds: ["iron-man", "thor"]
    };

    expect(deployment.teamId).toBe("team-a");
    expect(deployment.fighterIds).toEqual(["iron-man", "thor"]);
  });
});