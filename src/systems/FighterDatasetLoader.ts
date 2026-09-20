import type { FighterDefinition } from "../core/FighterDefinition";
import { validateFighterDefinition } from "./FighterDataValidator";
import { FighterRegistry } from "./FighterRegistry";

export function loadFighterDataset(
  fighters: FighterDefinition[],
  registry: FighterRegistry
): void {
  for (const fighter of fighters) {
    const validation = validateFighterDefinition(fighter);

    if (!validation.isValid) {
      throw new Error("Invalid fighter");
    }

    registry.register(fighter);
  }
}