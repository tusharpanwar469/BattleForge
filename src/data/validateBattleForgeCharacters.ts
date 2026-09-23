import { BATTLEFORGE_CHARACTERS } from "./BattleForgeCharacters";

const REQUIRED_FACTORS = [
    "power",
    "durability",
    "speed",
    "intelligence",
    "combatSkill",
    "abilities",
    "equipment",
    "battlefield",
    "endurance",
    "teamwork",
    "magic",
    "technology",
] as const;

const ids = new Set<string>();
const names = new Set<string>();

let errors = 0;

if (BATTLEFORGE_CHARACTERS.length !== 80) {
    console.error(
        `Expected 80 characters, found ${BATTLEFORGE_CHARACTERS.length}.`
    );
    errors++;
}

const mcuCount = BATTLEFORGE_CHARACTERS.filter(
    (fighter) => fighter.universe === "MCU"
).length;

const dcCount = BATTLEFORGE_CHARACTERS.filter(
    (fighter) => fighter.universe === "DC"
).length;

if (mcuCount !== 55) {
    console.error(`Expected 55 MCU characters, found ${mcuCount}.`);
    errors++;
}

if (dcCount !== 25) {
    console.error(`Expected 25 DC characters, found ${dcCount}.`);
    errors++;
}

for (const fighter of BATTLEFORGE_CHARACTERS) {
    if (ids.has(fighter.id)) {
        console.error(`Duplicate fighter ID: ${fighter.id}`);
        errors++;
    }

    ids.add(fighter.id);

    if (names.has(fighter.name)) {
        console.error(`Duplicate fighter name: ${fighter.name}`);
        errors++;
    }

    names.add(fighter.name);

    if (fighter.basePrice < 1 || fighter.basePrice > 10) {
        console.error(
            `${fighter.name}: invalid base price ${fighter.basePrice}`
        );
        errors++;
    }

    for (const factor of REQUIRED_FACTORS) {
        const value = fighter.factors[factor];

        if (typeof value !== "number") {
            console.error(
                `${fighter.name}: missing factor ${factor}`
            );
            errors++;
            continue;
        }

        if (value < 0 || value > 100) {
            console.error(
                `${fighter.name}: ${factor} must be between 0 and 100.`
            );
            errors++;
        }
    }
}

if (errors > 0) {
    console.error(
        `\nBattleForge dataset validation FAILED: ${errors} error(s).`
    );
} else {
    console.log("BattleForge dataset validation PASSED.");
    console.log(`Characters: ${BATTLEFORGE_CHARACTERS.length}`);
    console.log(`MCU: ${mcuCount}`);
    console.log(`DC: ${dcCount}`);
    console.log(`Unique IDs: ${ids.size}`);
    console.log(`Unique names: ${names.size}`);
}