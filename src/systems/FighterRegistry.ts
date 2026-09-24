import type { FighterDefinition } from "../core/FighterDefinition";
import { validateFighterDefinition } from "./FighterDataValidator";

export class FighterRegistry {
    private readonly fighters = new Map<
        string,
        FighterDefinition
    >();

    register(fighter: FighterDefinition): void {
        const validation =
            validateFighterDefinition(fighter);

        if (!validation.isValid) {
            throw new Error(
                `Invalid fighter "${fighter.id}": ${validation.errors.join(
                    " "
                )}`
            );
        }

        const normalizedId =
            fighter.id.trim().toLowerCase();

        if (this.fighters.has(normalizedId)) {
            throw new Error(
                `Fighter with id "${fighter.id}" is already registered.`
            );
        }

        this.fighters.set(
            normalizedId,
            fighter
        );
    }

    getById(
        id: string
    ): FighterDefinition | undefined {
        const normalizedId =
            id.trim().toLowerCase();

        return this.fighters.get(normalizedId);
    }

    has(id: string): boolean {
        const normalizedId =
            id.trim().toLowerCase();

        return this.fighters.has(normalizedId);
    }

    getAll(): FighterDefinition[] {
        return [
            ...this.fighters.values()
        ];
    }

    get size(): number {
        return this.fighters.size;
    }

    clear(): void {
        this.fighters.clear();
    }
}