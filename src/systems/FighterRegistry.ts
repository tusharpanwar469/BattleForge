import type { FighterDefinition } from "../core/FighterDefinition";
import { validateFighterDefinition } from "./FighterDataValidator";

export class FighterRegistry {
  private readonly fighters = new Map<string, FighterDefinition>();

  register(fighter: FighterDefinition): void {
    const validation = validateFighterDefinition(fighter);

    if (!validation.isValid) {
      throw new Error(
        `Invalid fighter "${fighter.id}": ${validation.errors.join(" ")}`
      );
    }

    if (this.fighters.has(fighter.id)) {
      throw new Error(`Fighter with id "${fighter.id}" is already registered.`);
    }

    this.fighters.set(fighter.id, fighter);
  }

  getById(id: string): FighterDefinition | undefined {
    return this.fighters.get(id);
  }

  has(id: string): boolean {
    return this.fighters.has(id);
  }

  getAll(): FighterDefinition[] {
    return [...this.fighters.values()];
  }

  get size(): number {
    return this.fighters.size;
  }

  clear(): void {
    this.fighters.clear();
  }
}
