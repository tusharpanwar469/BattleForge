import { describe, expect, it } from "vitest";
import type { BattleEvent, BattleEventType } from "../core/BattleEvent";

describe("BattleEvent", () => {
  it("supports all authoritative BattleForge event types", () => {
    const eventTypes: BattleEventType[] = [
      "CLASH",
      "COUNTER",
      "ADVANTAGE",
      "CRITICAL",
      "TURNING_POINT",
      "ABILITY_OVERLOAD",
      "PROTECTION",
      "FALL",
      "VICTORY"
    ];

    expect(eventTypes).toHaveLength(9);
  });

  it("represents a battle event with its type, round, and description", () => {
    const event: BattleEvent = {
      type: "CLASH",
      round: 1,
      description: "The two teams engaged in a direct clash."
    };

    expect(event.type).toBe("CLASH");
    expect(event.round).toBe(1);
    expect(event.description).toBe(
      "The two teams engaged in a direct clash."
    );
  });
});