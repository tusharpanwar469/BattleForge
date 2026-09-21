import Phaser from "phaser";

export class AuctionScene extends Phaser.Scene {
    constructor() {
        super("AuctionScene");
    }

    create() {
        // Title
        this.add.text(640, 50, "AUCTION PHASE", {
            fontSize: "48px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Current player
        this.add.text(640, 130, "CURRENT PLAYER", {
            fontSize: "28px",
            color: "#aaaaaa",
        }).setOrigin(0.5);

        // Player placeholder
        this.add.text(640, 220, "PLAYER NAME", {
            fontSize: "42px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Base price
        this.add.text(640, 280, "Base Price: $5", {
            fontSize: "26px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Team panels
        

        const teams = [
            { name: "TEAM A", x: 160 },
            { name: "TEAM B", x: 480 },
            { name: "TEAM C", x: 800 },
            { name: "TEAM D", x: 1120 },
        ];

          teams.forEach((team) => {
    this.add.text(team.x, 500, team.name, {
        fontSize: "28px",
        color: "#ffffff",
    }).setOrigin(0.5);

    const bidAmounts = [1, 2, 5];

    bidAmounts.forEach((amount, index) => {
        const bidButton = this.add
            .text(team.x, 560 + index * 50, `BID +$${amount}`, {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#333333",
                padding: {
                    x: 15,
                    y: 8,
                },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        bidButton.on("pointerdown", () => {
            console.log(`${team.name} selected BID +$${amount}`);
        });
    });
});
    }
}