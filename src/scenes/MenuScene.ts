import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        this.add.text(640, 360, "MAIN MENU", {
            fontSize: "48px",
            color: "#ffffff",
        }).setOrigin(0.5);

        const startButton = this.add.text(640, 450, "START WAR", {
            fontSize: "32px",
            color: "#ffffff",
            backgroundColor: "#333333",
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10,
            },
        }).setOrigin(0.5);

        startButton.setInteractive({ useHandCursor: true });

        startButton.on("pointerover", () => {
            startButton.setStyle({
                color: "#ffff00",
            });
        });

        startButton.on("pointerout", () => {
            startButton.setStyle({
                color: "#ffffff",
            });
        });

        startButton.on("pointerdown", () => {
            this.scene.start("AuctionScene");
        });
    }
}