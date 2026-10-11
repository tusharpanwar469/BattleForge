import Phaser from "phaser";
import type { TeamState } from "../core/TeamState";
import { TeamManager } from "../systems/TeamManager";
import { BATTLEFORGE_CHARACTERS } from "../data/BattleForgeCharacters";

export class TeamsScene extends Phaser.Scene {
    private teamManager!: TeamManager;
    private teams: TeamState[] = [];

    constructor() {
        super("TeamsScene");
    }

    create(): void {
        this.teamManager = this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error("TeamManager not found.");
        }

        this.teams = this.teamManager.getTeams();

        this.add.text(640, 35, "TEAM ROSTERS", {
            fontSize: "36px",
            color: "#ffffff",
        }).setOrigin(0.5);

        const fighterNames = new Map(
            BATTLEFORGE_CHARACTERS.map((fighter) => [
                fighter.id.toLowerCase(),
                fighter.name,
            ]),
        );

        const columnX = [175, 475, 775, 1075];

        this.teams.forEach((team, index) => {
            const x = columnX[index];

            this.add.text(x, 95, team.name, {
                fontSize: "22px",
                color: "#ffff00",
                wordWrap: { width: 250 },
                align: "center",
            }).setOrigin(0.5);

            const eliminated = new Set(
                team.eliminatedFighters.map((id) => id.toLowerCase()),
            );

            const aliveIds = team.roster.filter(
                (id) => !eliminated.has(id.toLowerCase()),
            );

            const eliminatedIds = team.eliminatedFighters;

            this.add.text(x - 125, 145, `ALIVE (${aliveIds.length})`, {
                fontSize: "17px",
                color: "#66ff99",
            });

            this.add.text(
                x - 125,
                175,
                aliveIds.length
                    ? aliveIds.map((id) =>
                        fighterNames.get(id.toLowerCase()) ?? id,
                    ).join("\n")
                    : "No living fighters",
                {
                    fontSize: "14px",
                    color: "#ffffff",
                    lineSpacing: 5,
                    wordWrap: { width: 250 },
                },
            );

            this.add.text(
                x - 125,
                480,
                `ELIMINATED (${eliminatedIds.length})`,
                {
                    fontSize: "17px",
                    color: "#ff7777",
                },
            );

            this.add.text(
                x - 125,
                510,
                eliminatedIds.length
                    ? eliminatedIds.map((id) =>
                        fighterNames.get(id.toLowerCase()) ?? id,
                    ).join("\n")
                    : "No eliminated fighters",
                {
                    fontSize: "14px",
                    color: "#ffcccc",
                    lineSpacing: 5,
                    wordWrap: { width: 250 },
                },
            );
        });

        const backButton = this.add.text(
            640,
            690,
            "BACK TO COMMAND CENTER",
            {
                fontSize: "22px",
                color: "#ffffff",
                backgroundColor: "#263746",
                padding: { x: 20, y: 12 },
            },
        ).setOrigin(0.5).setInteractive({
            useHandCursor: true,
        });

        backButton.on("pointerover", () => {
            backButton.setStyle({ color: "#ffff00" });
        });

        backButton.on("pointerout", () => {
            backButton.setStyle({ color: "#ffffff" });
        });

        backButton.on("pointerdown", () => {
            this.scene.start("CommandCenterScene");
        });
    }
}