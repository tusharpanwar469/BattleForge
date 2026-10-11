import Phaser from "phaser";

interface BattleHistoryEntry {
    round: number;
    winnerTeamId: string;
    deployedFighters: string[];
    reason: string;
}

export class HistoryScene extends Phaser.Scene {
    constructor() {
        super("HistoryScene");
    }

    create(): void {
        this.add.text(640, 45, "BATTLE HISTORY", {
            fontSize: "38px",
            color: "#ffffff",
        }).setOrigin(0.5);

        const history =
            (this.game.registry.get("battleHistory") as
                | BattleHistoryEntry[]
                | undefined) ?? [];

        if (history.length === 0) {
            this.add.text(
                640,
                300,
                "No battles recorded yet.\nBattle results will appear here after the battle system is integrated.",
                {
                    fontSize: "22px",
                    color: "#aaaaaa",
                    align: "center",
                    wordWrap: { width: 850 },
                    lineSpacing: 12,
                },
            ).setOrigin(0.5);
        } else {
            const lines = history.map((entry) => {
                const deployed = entry.deployedFighters.length
                    ? entry.deployedFighters.join(", ")
                    : "No fighter details recorded";

                return [
                    `ROUND ${entry.round}`,
                    `Winner: ${entry.winnerTeamId}`,
                    `Deployed fighters: ${deployed}`,
                    `Explanation: ${entry.reason}`,
                ].join("\n");
            });

            this.add.text(
                70,
                105,
                lines.join("\n\n------------------------------\n\n"),
                {
                    fontSize: "17px",
                    color: "#ffffff",
                    lineSpacing: 6,
                    wordWrap: { width: 1100 },
                },
            );
        }

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