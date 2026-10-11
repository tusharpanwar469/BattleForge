import Phaser from "phaser";
import type { TeamState } from "../core/TeamState";
import { TeamManager } from "../systems/TeamManager";

export class CommandCenterScene extends Phaser.Scene {
    private teamManager!: TeamManager;
    private teams: TeamState[] = [];

    constructor() {
        super("CommandCenterScene");
    }

    create(): void {
        this.teamManager = this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error("TeamManager not found.");
        }

        this.teams = this.teamManager.getTeams();

        this.add.text(640, 65, "BATTLEFORGE COMMAND CENTER", {
            fontSize: "36px",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.add.text(640, 112, "Choose your next operation", {
            fontSize: "20px",
            color: "#aaaaaa",
        }).setOrigin(0.5);

        const auctionComplete =
            this.game.registry.get("auctionPhaseComplete") === true;

        const tradeComplete =
            this.game.registry.get("tradePhaseComplete") === true;

        const battleUnlocked = auctionComplete && tradeComplete;

        const navItems = [
            {
                label: "AUCTION",
                x: 220,
                action: () => this.openAuction(),
                disabled: auctionComplete,
            },
            {
                label: "BATTLE",
                x: 500,
                action: () => this.openBattle(battleUnlocked),
                disabled: !battleUnlocked,
            },
            {
                label: "TEAMS",
                x: 780,
                action: () => this.openTeams(),
                disabled: false,
            },
            {
                label: "HISTORY",
                x: 1060,
                action: () => this.openHistory(),
                disabled: false,
            },
        ];

        navItems.forEach((item) => {
            this.createNavButton(
                item.x,
                190,
                item.label,
                item.action,
                item.disabled,
            );
        });

        this.add.text(
            640,
            300,
            battleUnlocked
                ? "All pre-battle phases are complete."
                : "Complete the auction and trade phase to unlock Battle.",
            {
                fontSize: "20px",
                color: battleUnlocked ? "#66ff99" : "#ffcc66",
                align: "center",
                wordWrap: { width: 800 },
            },
        ).setOrigin(0.5);

        this.add.text(640, 390, "REGISTERED TEAMS", {
            fontSize: "24px",
            color: "#aaaaaa",
        }).setOrigin(0.5);

        this.teams.forEach((team, index) => {
            const x = 220 + index * 280;

            this.add.text(x, 445, team.name, {
                fontSize: "20px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 240 },
            }).setOrigin(0.5);

            this.add.text(x, 480, `Budget: $${team.budget}`, {
                fontSize: "17px",
                color: "#66ff99",
            }).setOrigin(0.5);
        });
    }

    private createNavButton(
        x: number,
        y: number,
        label: string,
        action: () => void,
        disabled: boolean,
    ): void {
        const button = this.add.text(x, y, label, {
            fontSize: "22px",
            color: disabled ? "#777777" : "#ffffff",
            backgroundColor: disabled ? "#222222" : "#263746",
            padding: { x: 18, y: 14 },
        }).setOrigin(0.5);

        button.setInteractive({ useHandCursor: true });

        if (disabled) {
            button.on("pointerdown", () => {
                if (label === "BATTLE") {
                    this.showNotice(
                        "BATTLE LOCKED",
                        "Complete the auction and trade phase first.",
                    );
                }
            });

            return;
        }

        button.on("pointerover", () => {
            button.setStyle({ color: "#ffff00" });
        });

        button.on("pointerout", () => {
            button.setStyle({ color: "#ffffff" });
        });

        button.on("pointerdown", action);
    }

    private openAuction(): void {
        const auctionComplete =
            this.game.registry.get("auctionPhaseComplete") === true;

        if (auctionComplete) {
            this.showNotice(
                "AUCTION COMPLETE",
                "The auction has already finished.",
            );
            return;
        }

        this.scene.start("AuctionScene");
    }

    private openBattle(battleUnlocked: boolean): void {
        if (!battleUnlocked) {
            this.showNotice(
                "BATTLE LOCKED",
                "Finish the auction and trade phase before starting battle.",
            );
            return;
        }

        this.scene.start("SelectionScene");
    }

    private openTeams(): void {
        this.scene.start("TeamsScene");
    }

    private openHistory(): void {
        this.scene.start("HistoryScene");
    }

    private showNotice(title: string, message: string): void {
        const overlay = this.add.container(640, 560);

        const background = this.add.rectangle(
            0,
            0,
            560,
            120,
            0x17212b,
            0.98,
        ).setStrokeStyle(2, 0xffcc66);

        const heading = this.add.text(0, -28, title, {
            fontSize: "22px",
            color: "#ffcc66",
            fontStyle: "bold",
        }).setOrigin(0.5);

        const body = this.add.text(0, 12, message, {
            fontSize: "17px",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 500 },
        }).setOrigin(0.5);

        overlay.add([background, heading, body]);

        this.time.delayedCall(2500, () => {
            overlay.destroy();
        });
    }
}