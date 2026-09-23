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
    private budgetTexts = new Map<string, Phaser.GameObjects.Text>();
    private auctionTimer!: Phaser.Time.TimerEvent;
    private auctionTimerText!: Phaser.GameObjects.Text;
    private auctionSeconds = 9;
    private auctionResultText!: Phaser.GameObjects.Text;
    private confirmationButton!: Phaser.GameObjects.Text;
    private confirmationStatusText!: Phaser.GameObjects.Text;
    private confirmationButtons = new Map<string, Phaser.GameObjects.Text>();

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

        this.auctionTimerText = this.add.text(
               640,
               410,
              "TIME LEFT: 9",
            {
               fontSize: "24px",
               color: "#ffffff",
            }
             ).setOrigin(0.5);
             this.startAuctionTimer();
             this.auctionResultText = this.add.text(
               640,
               450,
               "",
            {
              fontSize: "36px",
              color: "#ff0000",
            }
             ).setOrigin(0.5);

             this.confirmationButton = this.add
    .text(180, 420, "REQUEST CONFIRMATION", {
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#444444",
        padding: {
            x: 15,
            y: 8,
        },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    this.confirmationButton.setVisible(false);

    this.confirmationButton.on("pointerdown", () => {
        const highestBidderId =
            this.auctionSystem.getHighestBidderId();

        if (!highestBidderId) {
            return;
        }

    const success =
        this.auctionSystem.requestConfirmation(highestBidderId);

        if (success) {
    this.confirmationStatusText.setText(
        "CONFIRMATION REQUESTED"
    );

    this.confirmationButton.setVisible(false);

    const teamPositions = [160, 480, 800, 1120];

    this.teams.forEach((team, index) => {
        if (team.id === highestBidderId) {
            return;
        }

        const confirmButton = this.add
            .text(
                teamPositions[index],
                420,
                `TEAM ${team.name} CONFIRM`,
                {
                    fontSize: "16px",
                    color: "#ffffff",
                    backgroundColor: "#444444",
                    padding: {
                        x: 10,
                        y: 8,
                    },
                }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        confirmButton.on("pointerdown", () => {
            const confirmed =
                this.auctionSystem.confirmSale(team.id);

           if (confirmed) {
    confirmButton.setVisible(false);

    console.log(
        `${team.name} confirmed the auction sale.`
    );

    if (this.auctionSystem.getAuctionOutcome() === "SOLD") {
        this.auctionTimer.remove(false);

        const winnerId =
            this.auctionSystem.getHighestBidderId();

        const winningTeam = this.teams.find(
            (teamState) => teamState.id === winnerId
        );

        if (winningTeam) {
            this.auctionResultText.setText(
                `SOLD! ${winningTeam.name} wins for $${this.auctionSystem.getCurrentBid()}`
            );
        }

        this.confirmationButton.setVisible(false);
        this.confirmationStatusText.setText(
            "SOLD — CONFIRMED"
        );

        this.confirmationButtons.forEach((button) => {
            button.setVisible(false);
        });
    }
    }
        });

        this.confirmationButtons.set(
            team.id,
            confirmButton
        );
    });
    }
    });
        this.confirmationStatusText = this.add.text(
            180,
            455,
            "",
        {
            fontSize: "20px",
            color: "#ffff00",
        }
        ).setOrigin(0.5);

        // Team panels
        

        
        const teamPositions = [160, 480, 800, 1120];

        this.teams.forEach((team, index) => {
        const x = teamPositions[index];

        this.add.text(x, 500, team.name, {
          fontSize: "28px",
          color: "#ffffff",
        }).setOrigin(0.5);

        const budgetText = this.add.text(
           x,
           530,
          `AVAILABLE: $${this.auctionSystem.getRemainingBudget(team)}`,
        {
           fontSize: "18px",
           color: "#aaaaaa",
        }
    ).setOrigin(0.5);

    this.budgetTexts.set(team.id, budgetText);

        const bidAmounts = [1, 2, 5, 10];

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

                this.confirmationButton.setVisible(true);
                this.confirmationStatusText.setText("");

                this.confirmationButtons.forEach((button) => {
                  button.destroy();
            });

this.confirmationButtons.clear();

                this.auctionTimerText.setText(
                  `TIME LEFT: ${this.auctionSystem.getAuctionSeconds()}`
                );

                this.auctionTimerText.setColor("#ffffff");

              const currentBid = this.auctionSystem.getCurrentBid();
              this.teams.forEach((teamState) => {
               const budgetText = this.budgetTexts.get(teamState.id);

              if (budgetText) {
                budgetText.setText(
                  `AVAILABLE: $${this.auctionSystem.getRemainingBudget(teamState)}`
                );
            }
        });

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
   private startAuctionTimer(): void {
    this.auctionTimerText.setText(
        `TIME LEFT: ${this.auctionSystem.getAuctionSeconds()}`
    );

    if (this.auctionTimer) {
        this.auctionTimer.remove(false);
    }

    this.auctionTimer = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            const seconds = this.auctionSystem.tickAuctionTimer();

            this.auctionTimerText.setText(
                `TIME LEFT: ${seconds}`
            );

            if (seconds === 6) {
                this.auctionTimerText.setColor("#ffff00");
                console.log("Auction warning: 6 seconds remaining.");
            }

            if (seconds === 3) {
                this.auctionTimerText.setColor("#ff0000");
                console.log("Auction warning: 3 seconds remaining.");
            }

            if (this.auctionSystem.isAuctionExpired()) {
    this.auctionTimer.remove(false);

    const outcome = this.auctionSystem.getAuctionOutcome();

    if (outcome === "SOLD") {
        const winnerId = this.auctionSystem.getHighestBidderId();

        const winningTeam = this.teams.find(
            (team) => team.id === winnerId
        );

        if (winningTeam) {
            this.auctionResultText.setText(
                `SOLD! ${winningTeam.name} wins for $${this.auctionSystem.getCurrentBid()}`
            );

            console.log(
                `SOLD! ${winningTeam.name} wins for $${this.auctionSystem.getCurrentBid()}.`
            );
        }
    }

        if (outcome === "UNSOLD") {
            this.auctionResultText.setText("UNSOLD — No bids placed.");

        console.log("UNSOLD — No bids placed.");
        }
    }
        },
    });
}
}