import Phaser from "phaser";
import { TeamManager } from "../systems/TeamManager";

export class TeamSetupScene extends Phaser.Scene {
    private nameInputs: HTMLInputElement[] = [];
    private teamManager!: TeamManager;

    constructor() {
        super("TeamSetupScene");
    }

    create(): void {
        this.teamManager = new TeamManager();

        this.game.registry.set(
            "teamManager",
            this.teamManager
        );

        this.add.text(
            640,
            70,
            "TEAM SETUP",
            {
                fontSize: "48px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.add.text(
            640,
            125,
            "Enter a name for each team",
            {
                fontSize: "24px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        const positions = [
            { label: "PLAYER 1", y: 220 },
            { label: "PLAYER 2", y: 300 },
            { label: "PLAYER 3", y: 380 },
            { label: "PLAYER 4", y: 460 },
        ];

        positions.forEach((player, index) => {
            this.add.text(
                400,
                player.y,
                player.label,
                {
                    fontSize: "22px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);

            const input =
                document.createElement("input");

            input.type = "text";
            input.placeholder =
                `Enter Team ${index + 1} Name`;
            input.maxLength = 20;

            input.style.position = "absolute";
            input.style.left = "500px";
            input.style.top =
                `${player.y - 20}px`;
            input.style.width = "280px";
            input.style.height = "40px";
            input.style.fontSize = "20px";
            input.style.padding = "5px 10px";
            input.style.boxSizing = "border-box";

            document.body.appendChild(input);

            this.nameInputs.push(input);
        });

        const confirmButton = this.add.text(
            640,
            570,
            "CONFIRM TEAMS",
            {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#333333",
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10,
                },
            }
        ).setOrigin(0.5);

        confirmButton.setInteractive({
            useHandCursor: true,
        });

        confirmButton.on(
            "pointerdown",
            () => {
                const teamNames =
                    this.nameInputs.map(
                        (input) =>
                            input.value.trim()
                    );

                if (
                    teamNames.some(
                        (name) =>
                            name.length === 0
                    )
                ) {
                    console.log(
                        "All four team names are required."
                    );

                    return;
                }

                this.teamManager.createTeams(
                    teamNames
                );

                console.log(
                    "Teams created:",
                    this.teamManager.getTeams()
                );

                this.nameInputs.forEach(
                    (input) => input.remove()
                );

                this.nameInputs = [];

                this.scene.start(
                    "AuctionScene"
                );
            }
        );
    }

    shutdown(): void {
        this.nameInputs.forEach(
            (input) => input.remove()
        );

        this.nameInputs = [];
    }
}