import Phaser from "phaser";
import { AuctionSystem } from "../systems/AuctionSystem";
import { TeamManager } from "../systems/TeamManager";
import { TeamState } from "../core/TeamState";

export class AuctionScene extends Phaser.Scene {
    private auctionSystem!: AuctionSystem;
    private teams: TeamState[] = [];
    private teamManager!:TeamManager;
    private currentBidText!: Phaser.GameObjects.Text;
    private leadingTeamText!: Phaser.GameObjects.Text;

    constructor() {
        super("AuctionScene");
    }


    create() {
        this.auctionSystem = new AuctionSystem(5);

       this.teamManager = this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error("TeamManager not found.");
        }

        this.teams = this.teamManager.getTeams();

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

        this.currentBidText = this.add.text(640, 325, "CURRENT BID: $5", {
        fontSize: "26px",
         color: "#00ff00",
        }).setOrigin(0.5);

        this.leadingTeamText = this.add.text(640, 365, "LEADING TEAM: None", {
        fontSize: "22px",
        color: "#ffffff",
        }).setOrigin(0.5);

        // Team panels
        

        
        const teamPositions = [160, 480, 800, 1120];

        this.teams.forEach((team, index) => {
        const x = teamPositions[index];

        this.add.text(x, 500, team.name, {
          fontSize: "28px",
          color: "#ffffff",
        }).setOrigin(0.5);

        const bidAmounts = [1, 2, 5];

         bidAmounts.forEach((amount, bidIndex) => {
         const bidButton = this.add
            .text(x, 560 + bidIndex * 50, `BID +$${amount}`, {
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
            const teamState = this.teams.find(
                (teamState) => teamState.name === team.name
            );

            if (!teamState) {
                return;
            }

            const success = this.auctionSystem.placeBid(
                teamState,
                amount
            );

            if (success) {
              const currentBid = this.auctionSystem.getCurrentBid();

            this.currentBidText.setText(`CURRENT BID: $${currentBid}`);

              this.leadingTeamText.setText(
             `LEADING TEAM: ${teamState.name}`
            );

          console.log(
           `${team.name} bid +$${amount}. Current bid: $${currentBid}`
          );
    }
            else {
                console.log(`${team.name} cannot place this bid.`);
            }
        });
    });
});
    }
}