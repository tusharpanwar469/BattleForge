import Phaser from "phaser";
import { AuctionSystem } from "../systems/AuctionSystem";
import { AuctionSaleManager } from "../systems/AuctionSaleManager";
import { FighterRegistry } from "../systems/FighterRegistry";
import { TeamRosterManager } from "../systems/TeamRosterManager";
import { TeamManager } from "../systems/TeamManager";
import type { TeamState } from "../core/TeamState";
import {
    AUCTION_FIGHTERS,
    type AuctionFighter,
} from "../data/AuctionFighters";
import { BATTLEFORGE_CHARACTERS } from "../data/BattleForgeCharacters";

export class AuctionScene extends Phaser.Scene {
    private auctionSystem!: AuctionSystem;
    private auctionSaleManager!: AuctionSaleManager;
    private fighterRegistry!: FighterRegistry;
    private teamRosterManager!: TeamRosterManager;
    private teamManager!: TeamManager;

    private teams: TeamState[] = [];

    private currentBidText!: Phaser.GameObjects.Text;
    private leadingTeamText!: Phaser.GameObjects.Text;
    private budgetTexts = new Map<string, Phaser.GameObjects.Text>();

    private auctionTimer!: Phaser.Time.TimerEvent;
    private auctionTimerText!: Phaser.GameObjects.Text;
    private auctionWarningText!: Phaser.GameObjects.Text;
    private auctionResultText!: Phaser.GameObjects.Text;
    private nextFighterButton!: Phaser.GameObjects.Text;

    private auctionComplete = false;
    private auctionStarted = false;
    private auctionResolved = false;
    private fighterPresented = false;

    private bidButtons: Phaser.GameObjects.Text[] = [];
    private openingBidButtons: Phaser.GameObjects.Text[] = [];

    private fighterNameText!: Phaser.GameObjects.Text;
    private fighterBasePriceText!: Phaser.GameObjects.Text;
    private fighterProgressText!: Phaser.GameObjects.Text;

    private auctionFighters: AuctionFighter[] = [];
    private unsoldFighterIds: string[] = [];
    private currentFighterIndex = 0;
    private currentFighter!: AuctionFighter;

    constructor() {
        super("AuctionScene");
    }

    create(): void {
        this.auctionComplete = false;
        this.auctionStarted = false;
        this.auctionResolved = false;
        this.fighterPresented = false;

        this.bidButtons = [];
        this.openingBidButtons = [];
        this.budgetTexts.clear();

        this.teamManager = this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error("TeamManager not found.");
        }

        this.teams = this.teamManager.getTeams();

        if (this.teams.length !== 4) {
            throw new Error("BattleForge requires exactly 4 teams.");
        }

        if (AUCTION_FIGHTERS.length === 0) {
            throw new Error("No auction fighters available.");
        }

        this.fighterRegistry = new FighterRegistry();

        for (const fighter of BATTLEFORGE_CHARACTERS) {
            this.fighterRegistry.register(fighter);
        }

        if (this.fighterRegistry.size !== 80) {
            throw new Error(
                `Expected 80 registered fighters, found ${this.fighterRegistry.size}.`
            );
        }

        this.teamRosterManager = new TeamRosterManager(
            this.fighterRegistry
        );

        this.auctionSaleManager = new AuctionSaleManager(
            this.teamRosterManager
        );

        this.auctionFighters = [...AUCTION_FIGHTERS];

        // Shuffle the order in which fighters appear.
        for (let i = this.auctionFighters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [
                this.auctionFighters[i],
                this.auctionFighters[j],
            ] = [
                this.auctionFighters[j],
                this.auctionFighters[i],
            ];
        }

        this.unsoldFighterIds = [];
        this.game.registry.set("unsoldFighterIds", []);

        this.currentFighterIndex = 0;
        this.currentFighter = this.auctionFighters[0];

        this.auctionSystem = new AuctionSystem(
            this.currentFighter.basePrice
        );

        this.auctionSystem.setCurrentFighter(this.currentFighter);

        // Header
        this.add.text(640, 50, "AUCTION PHASE", {
            fontSize: "48px",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.add.text(640, 130, "CURRENT PLAYER", {
            fontSize: "28px",
            color: "#aaaaaa",
        }).setOrigin(0.5);

        this.fighterNameText = this.add.text(
            640,
            220,
            this.currentFighter.name,
            {
                fontSize: "42px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.fighterProgressText = this.add.text(
            640, 255, "",
            {
                fontSize: "18px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        this.fighterBasePriceText = this.add.text(
            640, 295, "",
            {
                fontSize: "26px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.currentBidText = this.add.text(
            640, 340, "",
            {
                fontSize: "26px",
                color: "#00ff00",
            }
        ).setOrigin(0.5);

        this.leadingTeamText = this.add.text(
            640, 380, "LEADING TEAM: None",
            {
                fontSize: "22px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.auctionTimerText = this.add.text(
            640, 420, "",
            {
                fontSize: "1px",
                color: "#000000",
            }
        ).setOrigin(0.5);

        this.auctionTimerText.setVisible(false);

        this.auctionWarningText = this.add.text(
            640, 420, "",
            {
                fontSize: "26px",
                color: "#ffff00",
                fontStyle: "bold",
            }
        ).setOrigin(0.5);

        this.auctionResultText = this.add.text(
            640, 460, "",
            {
                fontSize: "28px",
                color: "#ff0000",
            }
        ).setOrigin(0.5);

        // Navigation button
        this.nextFighterButton = this.add
            .text(640, 420, "NEXT FIGHTER", {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#333333",
                padding: {
                    x: 25,
                    y: 12,
                },
            })
            .setOrigin(0.5)
            .setInteractive({
                useHandCursor: true,
            });

        this.nextFighterButton.on("pointerover", () => {
            this.nextFighterButton.setStyle({
                color: "#ffff00",
            });
        });

        this.nextFighterButton.on("pointerout", () => {
            this.nextFighterButton.setStyle({
                color: "#ffffff",
            });
        });

        this.nextFighterButton.on("pointerdown", () => {
            if (this.auctionComplete) {
                this.scene.start("TradeScene");
                return;
            }

            if (this.auctionResolved) {
                this.startNextFighter();
                return;
            }

            // The first click presents the initial fighter and
            // immediately starts its 9-second response window.
            // It does not place a bid.
            if (!this.fighterPresented && !this.auctionStarted) {
                this.presentCurrentFighter();
            }
        });

        // Team controls
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
                `AVAILABLE: $${team.budget}`,
                {
                    fontSize: "18px",
                    color: "#aaaaaa",
                }
            ).setOrigin(0.5);

            this.budgetTexts.set(team.id, budgetText);

            // Opening BID button: bids the fighter's base price.
            const openingBidButton = this.add
                .text(x, 570, "BID", {
                    fontSize: "20px",
                    color: "#ffffff",
                    backgroundColor: "#1f6f43",
                    padding: {
                        x: 15,
                        y: 8,
                    },
                })
                .setOrigin(0.5)
                .setInteractive({
                    useHandCursor: true,
                });

            this.openingBidButtons.push(openingBidButton);
            openingBidButton.setVisible(false);

            openingBidButton.on("pointerdown", () => {
                if (
                    !this.fighterPresented ||
                    this.auctionStarted ||
                    this.auctionResolved ||
                    this.auctionComplete
                ) {
                    return;
                }

                const teamState = this.teams.find(
                    (state) => state.id === team.id
                );

                if (!teamState) {
                    return;
                }

                if (teamState.roster.length >= 16) {
                    console.log(
                        `${team.name} already has the maximum roster of 16 fighters.`
                    );
                    return;
                }

                const success =
                    this.auctionSystem.placeOpeningBid(teamState);

                if (!success) {
                    console.log(
                        `${team.name} cannot place the opening bid.`
                    );
                    return;
                }

                // Starts/reset the timer and reveals increments.
                this.startCurrentFighter();

                const currentBid =
                    this.auctionSystem.getCurrentBid();

                this.currentBidText.setText(
                    `CURRENT BID: $${currentBid}`
                );

                this.leadingTeamText.setText(
                    `LEADING TEAM: ${teamState.name}`
                );

                this.updateBudgetDisplay();
                this.auctionWarningText.setText("");

                console.log(
                    `${team.name} opened bidding at $${currentBid}.`
                );
            });

            // Increment buttons: no +$10 button.
            const bidAmounts = [1, 2, 5];

            bidAmounts.forEach((amount, bidIndex) => {
                const bidButton = this.add
                    .text(
                        x,
                        570 + bidIndex * 45,
                        `+$${amount}`,
                        {
                            fontSize: "20px",
                            color: "#ffffff",
                            backgroundColor: "#333333",
                            padding: {
                                x: 15,
                                y: 8,
                            },
                        }
                    )
                    .setOrigin(0.5)
                    .setInteractive({
                        useHandCursor: true,
                    });

                bidButton.setVisible(false);
                this.bidButtons.push(bidButton);

                bidButton.on("pointerdown", () => {
                    if (
                        !this.auctionStarted ||
                        this.auctionResolved ||
                        this.auctionComplete
                    ) {
                        return;
                    }

                    const teamState = this.teams.find(
                        (state) => state.id === team.id
                    );

                    if (!teamState) {
                        return;
                    }

                    if (teamState.roster.length >= 16) {
                        console.log(
                            `${team.name} already has the maximum roster of 16 fighters.`
                        );
                        return;
                    }

                    const success = this.auctionSystem.placeBid(
                        teamState,
                        amount
                    );

                    if (!success) {
                        console.log(
                            `${team.name} cannot place this bid.`
                        );
                        return;
                    }

                    const currentBid =
                        this.auctionSystem.getCurrentBid();

                    this.currentBidText.setText(
                        `CURRENT BID: $${currentBid}`
                    );

                    this.leadingTeamText.setText(
                        `LEADING TEAM: ${teamState.name}`
                    );

                    this.auctionWarningText.setText("");
                    this.auctionWarningText.setColor("#ffff00");

                    this.updateBudgetDisplay();

                    console.log(
                        `${team.name} bid +$${amount}. Current bid: $${currentBid}`
                    );
                });
            });
        });

        this.updateFighterDisplay();
        this.prepareForNextFighter();
    }

    private getAuctionState() {
        return this.auctionSystem.getState();
    }

    /**
     * Presents a fighter and immediately starts the 9-second
     * response window. It does not place an opening bid.
     */
    private presentCurrentFighter(): void {
        if (
            this.auctionStarted ||
            this.auctionResolved ||
            this.auctionComplete ||
            this.fighterPresented
        ) {
            return;
        }

        this.fighterPresented = true;

        this.nextFighterButton.setVisible(false);

        this.showBidButtons(false);
        this.showOpeningBidButtons(true);

        this.updateFighterDisplay();

        // IMPORTANT: timer starts before anyone bids.
        this.startAuctionTimer();

        console.log(
            `Fighter presented: ${this.currentFighter.name}. Waiting for bids.`
        );
    }

    /**
     * A successful opening bid starts active bidding.
     * The AuctionSystem resets the timer for the opening bid.
     */
    private startCurrentFighter(): void {
        if (
            this.auctionStarted ||
            this.auctionResolved ||
            !this.fighterPresented
        ) {
            return;
        }

        this.auctionStarted = true;

        this.nextFighterButton.setVisible(false);
        this.auctionResultText.setText("");

        this.showOpeningBidButtons(false);
        this.showBidButtons(true);

        this.updateBudgetDisplay();

        // Restart the scene timer to follow the AuctionSystem's
        // reset response window after the opening bid.
        this.startAuctionTimer();

        console.log(
            `Auction bidding started for ${this.currentFighter.name}.`
        );
    }

    private startNextFighter(): void {
        if (!this.auctionResolved || this.auctionComplete) {
            return;
        }

        this.stopAuctionTimer();

        const nextIndex = this.currentFighterIndex + 1;

        if (nextIndex >= this.auctionFighters.length) {
            this.auctionComplete = true;
            this.auctionStarted = false;
            this.fighterPresented = false;

            this.showBidButtons(false);
            this.showOpeningBidButtons(false);

            this.nextFighterButton.setText("OPEN TRADE PHASE");
            this.nextFighterButton.setVisible(true);

            this.auctionResultText.setText(
                "AUCTION COMPLETE — ALL 80 FIGHTERS PROCESSED"
            );

            console.log("BattleForge auction completed.");
            return;
        }

        this.currentFighterIndex = nextIndex;
        this.currentFighter =
            this.auctionFighters[this.currentFighterIndex];

        this.auctionSystem.setCurrentFighter(this.currentFighter);

        // Reset state before presenting the new fighter.
        this.auctionStarted = false;
        this.auctionResolved = false;
        this.fighterPresented = false;

        this.showBidButtons(false);
        this.showOpeningBidButtons(false);

        this.updateFighterDisplay();

        // Present the new fighter, show opening BID buttons,
        // and start the timer immediately.
        this.presentCurrentFighter();

        console.log(
            `Next fighter presented: ${this.currentFighter.name}.`
        );
    }

    private prepareForNextFighter(): void {
        this.auctionStarted = false;
        this.auctionResolved = false;
        this.fighterPresented = false;

        this.stopAuctionTimer();

        this.showBidButtons(false);
        this.showOpeningBidButtons(false);

        this.auctionWarningText.setText("");
        this.nextFighterButton.setText("NEXT FIGHTER");
        this.nextFighterButton.setVisible(true);
    }

    private showBidButtons(visible: boolean): void {
        this.bidButtons.forEach((button) => {
            button.setVisible(visible);
        });
    }

    private showOpeningBidButtons(visible: boolean): void {
        this.openingBidButtons.forEach((button) => {
            button.setVisible(visible);
        });
    }

    private stopAuctionTimer(): void {
        if (this.auctionTimer) {
            this.auctionTimer.remove(false);
        }
    }

    private updateBudgetDisplay(): void {
        this.teams.forEach((team) => {
            const budgetText = this.budgetTexts.get(team.id);

            if (budgetText) {
                budgetText.setText(
                    `AVAILABLE: $${this.auctionSystem.getRemainingBudget(team)}`
                );
            }
        });
    }

    private updateFighterDisplay(): void {
        this.fighterNameText.setText(this.currentFighter.name);

        this.fighterProgressText.setText(
            `FIGHTER ${this.currentFighterIndex + 1} / ${this.auctionFighters.length}`
        );

        this.fighterBasePriceText.setText(
            `Base Price: $${this.currentFighter.basePrice}`
        );

        const state = this.getAuctionState();

        this.currentBidText.setText(
            state.currentBid === null
                ? "CURRENT BID: —"
                : `CURRENT BID: $${state.currentBid}`
        );

        this.leadingTeamText.setText("LEADING TEAM: None");

        this.auctionWarningText.setText("");
        this.auctionWarningText.setColor("#ffff00");

        this.auctionResultText.setText("");

        this.updateBudgetDisplay();
    }

    private resolveCurrentAuction(
        outcome: "SOLD" | "UNSOLD"
    ): void {
        if (this.auctionResolved) {
            return;
        }

        this.stopAuctionTimer();

        this.auctionWarningText.setText("");

        this.showBidButtons(false);
        this.showOpeningBidButtons(false);

        if (outcome === "SOLD") {
            const winnerId =
                this.auctionSystem.getHighestBidderId();

            const winningTeam = this.teams.find(
                (team) => team.id === winnerId
            );

            if (!winningTeam) {
                this.auctionResultText.setText(
                    "SALE ERROR — WINNING TEAM NOT FOUND"
                );

                console.error(
                    "Auction sale failed: winning team not found."
                );

                this.auctionResolved = true;
                this.auctionStarted = false;
                this.fighterPresented = false;

                this.showNextFighterButton();
                return;
            }

            const settlement =
                this.auctionSaleManager.settleSale(
                    this.getAuctionState(),
                    winningTeam
                );

            if (!settlement.success) {
                this.auctionResultText.setText(
                    `SALE ERROR — ${
                        settlement.errors[0] ??
                        "Unable to settle sale."
                    }`
                );

                console.error(
                    "Auction sale settlement failed:",
                    settlement.errors
                );

                this.auctionResolved = true;
                this.auctionStarted = false;
                this.fighterPresented = false;

                this.showNextFighterButton();
                return;
            }

            // Sale manager has already deducted the final price.
            // Clear the reservation so the amount isn't counted twice.
            this.auctionSystem.clearReservation(winningTeam.id);

            this.auctionResultText.setText(
                `SOLD! ${winningTeam.name} wins for $${settlement.finalPrice}`
            );

            console.log(
                `SOLD! ${winningTeam.name} wins for $${settlement.finalPrice}.`
            );

            this.updateBudgetDisplay();
        } else {
            const fighterId = this.currentFighter.id;

            if (
                !this.unsoldFighterIds.some(
                    (id) =>
                        id.toLowerCase() === fighterId.toLowerCase()
                )
            ) {
                this.unsoldFighterIds.push(fighterId);
            }

            this.game.registry.set(
                "unsoldFighterIds",
                [...this.unsoldFighterIds]
            );

            this.auctionResultText.setText(
                "UNSOLD — No bids placed."
            );

            console.log("UNSOLD — No bids placed.", fighterId);
        }

        // Reset all flags so NEXT FIGHTER can advance.
        this.auctionResolved = true;
        this.auctionStarted = false;
        this.fighterPresented = false;

        this.showNextFighterButton();
    }

    private showNextFighterButton(): void {
        this.showBidButtons(false);
        this.showOpeningBidButtons(false);

        const hasNextFighter =
            this.currentFighterIndex + 1 < this.auctionFighters.length;

        if (hasNextFighter) {
            this.nextFighterButton.setText("NEXT FIGHTER");
            this.nextFighterButton.setVisible(true);
        } else {
            this.auctionComplete = true;

            this.nextFighterButton.setText("OPEN TRADE PHASE");
            this.nextFighterButton.setVisible(true);

            this.auctionResultText.setText(
                `${this.auctionResultText.text} — AUCTION COMPLETE`
            );
        }
    }

    private startAuctionTimer(): void {
        this.stopAuctionTimer();

        this.auctionWarningText.setText("");

        this.auctionTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                // Timer runs while waiting for the opening bid too.
                if (
                    this.auctionResolved ||
                    this.auctionComplete ||
                    !this.fighterPresented
                ) {
                    return;
                }

                const seconds =
                    this.auctionSystem.tickAuctionTimer();

                if (seconds === 6) {
                    this.auctionWarningText.setText(
                        "⚠ AUCTION WARNING"
                    );

                    this.auctionWarningText.setColor("#ffff00");

                    console.log(
                        "Auction warning: 6 seconds remaining."
                    );
                }

                if (seconds === 3) {
                    this.auctionWarningText.setText(
                        "🚨 FINAL WARNING"
                    );

                    this.auctionWarningText.setColor("#ff0000");

                    console.log(
                        "Auction warning: 3 seconds remaining."
                    );
                }

                if (this.auctionSystem.isAuctionExpired()) {
                    const outcome =
                        this.auctionSystem.getAuctionOutcome();

                    if (
                        outcome === "SOLD" ||
                        outcome === "UNSOLD"
                    ) {
                        this.resolveCurrentAuction(outcome);
                    }
                }
            },
        });
    }
}