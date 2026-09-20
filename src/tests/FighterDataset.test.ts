import { describe, expect, it } from "vitest";
import { FIGHTER_DATASET } from "../data/FighterDataset";

describe("FighterDataset", () => {
  it("starts with a valid fighter definition dataset", () => {
    expect(Array.isArray(FIGHTER_DATASET)).toBe(true);
  });
});