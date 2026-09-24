import { BATTLEFORGE_CHARACTERS } from "./BattleForgeCharacters";

export interface AuctionFighter {
    id: string;
    name: string;
    basePrice: number;
}

export const AUCTION_FIGHTERS: AuctionFighter[] =
    BATTLEFORGE_CHARACTERS.map((fighter) => ({
        id: fighter.id,
        name: fighter.name,
        basePrice: fighter.basePrice,
    }));