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

    private teams: TeamState[] = [];
    private teamManager!: TeamManager;

    private currentBidText!: Phaser.GameObjects.Text;
    private leadingTeamText!: Phaser.GameObjects.Text;
    private budgetTexts = new Map<string, Phaser.GameObjects.Text>();

    private auctionTimer!: Phaser.Time.TimerEvent;
    private auctionTimerText!: Phaser.GameObjects.Text;
    private auctionWarningText!: Phaser.GameObjects.Text;

    private auctionResultText!: Phaser.GameObjects.Text;
    private nextFighterButton!: Phaser.GameObjects.Text;

    private bidButtons: Phaser.GameObjects.Text[] = [];

    private fighterNameText!: Phaser.GameObjects.Text;
    private fighterBasePriceText!: Phaser.GameObjects.Text;
    private fighterProgressText!: Phaser.GameObjects.Text;

    private auctionFighters: AuctionFighter[] = [];
    private currentFighterIndex = 0;
    private currentFighter!: AuctionFighter;

    private auctionResolved = false;
    private auctionStarted = false;

    constructor() {
        super("AuctionScene");
    }

    create(): void {
        this.teamManager =
            this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error("TeamManager not found.");
        }

        this.teams = this.teamManager.getTeams();

        if (this.teams.length !== 4) {
            throw new Error(
                "BattleForge requires exactly 4 teams."
            );
        }

        if (AUCTION_FIGHTERS.length === 0) {
            throw new Error(
                "No auction fighters available."
            );
        }

        // Register all BattleForge fighters.
        this.fighterRegistry =
            new FighterRegistry();

        for (const fighter of BATTLEFORGE_CHARACTERS) {
            this.fighterRegistry.register(fighter);
        }

        if (this.fighterRegistry.size !== 80) {
            throw new Error(
                `Expected 80 registered fighters, found ${this.fighterRegistry.size}.`
            );
        }

        // Approved roster and sale managers.
        this.teamRosterManager =
            new TeamRosterManager(
                this.fighterRegistry
            );

        this.auctionSaleManager =
            new AuctionSaleManager(
                this.teamRosterManager
            );

        // Randomize the auction order.
        this.auctionFighters = [
            ...AUCTION_FIGHTERS,
        ];

        for (
            let index =
                this.auctionFighters.length - 1;
            index > 0;
            index--
        ) {
            const randomIndex =
                Math.floor(
                    Math.random() *
                        (index + 1)
                );

            [
                this.auctionFighters[index],
                this.auctionFighters[randomIndex],
            ] = [
                this.auctionFighters[randomIndex],
                this.auctionFighters[index],
            ];
        }

        this.currentFighterIndex = 0;

        this.currentFighter =
            this.auctionFighters[0];

        this.auctionSystem =
            new AuctionSystem(
                this.currentFighter.basePrice
            );

        this.auctionSystem.setCurrentFighter(
            this.currentFighter
        );

        // --------------------------------------------------
        // TITLE
        // --------------------------------------------------

        this.add.text(
            640,
            50,
            "AUCTION PHASE",
            {
                fontSize: "48px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // CURRENT PLAYER
        // --------------------------------------------------

        this.add.text(
            640,
            130,
            "CURRENT PLAYER",
            {
                fontSize: "28px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // FIGHTER NAME
        // --------------------------------------------------

        this.fighterNameText =
            this.add.text(
                640,
                220,
                this.currentFighter.name,
                {
                    fontSize: "42px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // FIGHTER PROGRESS
        // --------------------------------------------------

        this.fighterProgressText =
            this.add.text(
                640,
                255,
                "",
                {
                    fontSize: "18px",
                    color: "#aaaaaa",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // BASE PRICE
        // --------------------------------------------------

        this.fighterBasePriceText =
            this.add.text(
                640,
                295,
                "",
                {
                    fontSize: "26px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // CURRENT BID
        // --------------------------------------------------

        this.currentBidText =
            this.add.text(
                640,
                340,
                "",
                {
                    fontSize: "26px",
                    color: "#00ff00",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // LEADING TEAM
        // --------------------------------------------------

        this.leadingTeamText =
            this.add.text(
                640,
                380,
                "LEADING TEAM: None",
                {
                    fontSize: "22px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // HIDDEN INTERNAL TIMER
        // --------------------------------------------------

        this.auctionTimerText =
            this.add.text(
                640,
                420,
                "",
                {
                    fontSize: "1px",
                    color: "#000000",
                }
            ).setOrigin(0.5);

        this.auctionTimerText.setVisible(false);

        // --------------------------------------------------
        // AUCTION WARNING
        // --------------------------------------------------

        this.auctionWarningText =
            this.add.text(
                640,
                420,
                "",
                {
                    fontSize: "26px",
                    color: "#ffff00",
                    fontStyle: "bold",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // AUCTION RESULT
        // --------------------------------------------------

        this.auctionResultText =
            this.add.text(
                640,
                460,
                "",
                {
                    fontSize: "36px",
                    color: "#ff0000",
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // NEXT FIGHTER BUTTON
        // --------------------------------------------------

        this.nextFighterButton =
            this.add
                .text(
                    640,
                    420,
                    "NEXT FIGHTER",
                    {
                        fontSize: "28px",
                        color: "#ffffff",
                        backgroundColor: "#333333",
                        padding: {
                            x: 25,
                            y: 12,
                        },
                    }
                )
                .setOrigin(0.5)
                .setInteractive({
                    useHandCursor: true,
                });

        this.nextFighterButton.on(
            "pointerover",
            () => {
                this.nextFighterButton.setStyle({
                    color: "#ffff00",
                });
            }
        );

        this.nextFighterButton.on(
            "pointerout",
            () => {
                this.nextFighterButton.setStyle({
                    color: "#ffffff",
                });
            }
        );

        this.nextFighterButton.on(
            "pointerdown",
            () => {
                if (this.auctionStarted) {
                    this.startNextFighter();
                } else {
                    this.startCurrentFighter();
                }
            }
        );

        // --------------------------------------------------
        // TEAM PANELS
        // --------------------------------------------------

        const teamPositions = [
            160,
            480,
            800,
            1120,
        ];

        this.teams.forEach(
            (team, index) => {
                const x =
                    teamPositions[index];

                this.add.text(
                    x,
                    500,
                    team.name,
                    {
                        fontSize: "28px",
                        color: "#ffffff",
                    }
                ).setOrigin(0.5);

                const budgetText =
                    this.add.text(
                        x,
                        530,
                        `AVAILABLE: $${team.budget}`,
                        {
                            fontSize: "18px",
                            color: "#aaaaaa",
                        }
                    ).setOrigin(0.5);

                this.budgetTexts.set(
                    team.id,
                    budgetText
                );

                const bidAmounts = [
                    1,
                    2,
                    5,
                    10,
                ];

                bidAmounts.forEach(
                    (amount, bidIndex) => {
                        const bidButton =
                            this.add
                                .text(
                                    x,
                                    560 +
                                        bidIndex *
                                            50,
                                    `BID +$${amount}`,
                                    {
                                        fontSize:
                                            "20px",
                                        color:
                                            "#ffffff",
                                        backgroundColor:
                                            "#333333",
                                        padding: {
                                            x: 15,
                                            y: 8,
                                        },
                                    }
                                )
                                .setOrigin(0.5)
                                .setInteractive({
                                    useHandCursor:
                                        true,
                                });

                        bidButton.setVisible(false);

                        this.bidButtons.push(
                            bidButton
                        );

                        bidButton.on(
                            "pointerdown",
                            () => {
                                if (
                                    !this.auctionStarted ||
                                    this.auctionResolved
                                ) {
                                    return;
                                }

                                const teamState =
                                    this.teams.find(
                                        (
                                            state
                                        ) =>
                                            state.id ===
                                            team.id
                                    );

                                if (!teamState) {
                                    return;
                                }

                                if (
                                    teamState.roster
                                        .length >= 16
                                ) {
                                    console.log(
                                        `${team.name} already has the maximum roster of 16 fighters.`
                                    );

                                    return;
                                }

                                const success =
                                    this.auctionSystem.placeBid(
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

                                this.updateBudgetDisplay();

                                this.currentBidText.setText(
                                    `CURRENT BID: $${currentBid}`
                                );

                                this.leadingTeamText.setText(
                                    `LEADING TEAM: ${teamState.name}`
                                );

                                this.auctionWarningText.setText(
                                    ""
                                );

                                this.auctionWarningText.setColor(
                                    "#ffff00"
                                );

                                console.log(
                                    `${team.name} bid +$${amount}. Current bid: $${currentBid}`
                                );
                            }
                        );
                    }
                );
            }
        );

        // Initial state:
        // Fighter information visible,
        // auction not started.
        this.updateFighterDisplay();
        this.prepareForNextFighter();
    }

    private getAuctionState() {
        return this.auctionSystem.getState();
    }

    private startCurrentFighter(): void {
        if (this.auctionStarted) {
            return;
        }

        this.auctionStarted = true;
        this.auctionResolved = false;

        this.nextFighterButton.setVisible(
            false
        );

        this.auctionResultText.setText(
            ""
        );

        this.showBidButtons(true);

        this.updateFighterDisplay();
        this.startAuctionTimer();

        console.log(
            `Auction started for ${this.currentFighter.name}.`
        );
    }

    private startNextFighter(): void {
        if (
            !this.auctionStarted ||
            !this.auctionResolved
        ) {
            return;
        }

        const nextIndex =
            this.currentFighterIndex + 1;

        if (
            nextIndex >=
            this.auctionFighters.length
        ) {
            this.nextFighterButton.setVisible(
                false
            );

            this.auctionResultText.setText(
                "AUCTION COMPLETE — ALL 80 FIGHTERS PROCESSED"
            );

            console.log(
                "BattleForge auction completed. All 80 fighters processed."
            );

            return;
        }

        this.currentFighterIndex =
            nextIndex;

        this.currentFighter =
            this.auctionFighters[
                this.currentFighterIndex
            ];

        this.auctionSystem.setCurrentFighter(
            this.currentFighter
        );

        this.auctionResolved = false;

        this.nextFighterButton.setVisible(
            false
        );

        this.showBidButtons(true);

        this.updateFighterDisplay();
        this.startAuctionTimer();

        console.log(
            `Next auction started: ${this.currentFighter.name}.`
        );
    }

    private prepareForNextFighter(): void {
        this.auctionStarted = false;
        this.auctionResolved = false;

        this.stopAuctionTimer();

        this.showBidButtons(false);

        this.auctionWarningText.setText(
            ""
        );

        this.nextFighterButton.setText(
            "NEXT FIGHTER"
        );

        this.nextFighterButton.setVisible(
            true
        );
    }

    private showBidButtons(
        visible: boolean
    ): void {
        this.bidButtons.forEach(
            (button) => {
                button.setVisible(visible);
            }
        );
    }

    private stopAuctionTimer(): void {
        if (this.auctionTimer) {
            this.auctionTimer.remove(false);
        }
    }

    private updateBudgetDisplay(): void {
        this.teams.forEach(
            (team) => {
                const budgetText =
                    this.budgetTexts.get(
                        team.id
                    );

                if (budgetText) {
                    budgetText.setText(
                        `AVAILABLE: $${this.auctionSystem.getRemainingBudget(
                            team
                        )}`
                    );
                }
            }
        );
    }

    private updateFighterDisplay(): void {
        this.fighterNameText.setText(
            this.currentFighter.name
        );

        this.fighterProgressText.setText(
            `FIGHTER ${
                this.currentFighterIndex + 1
            } / ${this.auctionFighters.length}`
        );

        this.fighterBasePriceText.setText(
            `Base Price: $${this.currentFighter.basePrice}`
        );

        const state =
            this.getAuctionState();

        this.currentBidText.setText(
            state.currentBid === null
                ? `CURRENT BID: $${state.basePrice}`
                : `CURRENT BID: $${state.currentBid}`
        );

        this.leadingTeamText.setText(
            "LEADING TEAM: None"
        );

        this.auctionWarningText.setText(
            ""
        );

        this.auctionWarningText.setColor(
            "#ffff00"
        );

        this.auctionResultText.setText(
            ""
        );

        this.updateBudgetDisplay();
    }

    private resolveCurrentAuction(
        outcome: "SOLD" | "UNSOLD"
    ): void {
        if (this.auctionResolved) {
            return;
        }

        this.stopAuctionTimer();

        this.auctionWarningText.setText(
            ""
        );

        this.showBidButtons(false);

        if (outcome === "SOLD") {
            const winnerId =
                this.auctionSystem.getHighestBidderId();

            const winningTeam =
                this.teams.find(
                    (team) =>
                        team.id === winnerId
                );

            if (!winningTeam) {
                this.auctionResultText.setText(
                    "SALE ERROR — WINNING TEAM NOT FOUND"
                );

                console.error(
                    "Auction sale failed: winning team not found."
                );

                this.auctionResolved = true;

                this.nextFighterButton.setVisible(
                    true
                );

                return;
            }

            const auctionState =
                this.getAuctionState();

            const settlement =
                this.auctionSaleManager.settleSale(
                    auctionState,
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

                this.nextFighterButton.setVisible(
                    true
                );

                return;
            }

            this.auctionResolved = true;

            this.auctionResultText.setText(
                `SOLD! ${winningTeam.name} wins for $${settlement.finalPrice}`
            );

            console.log(
                `SOLD! ${winningTeam.name} wins for $${settlement.finalPrice}.`
            );

            this.updateBudgetDisplay();
        }

        if (outcome === "UNSOLD") {
            this.auctionResolved = true;

            this.auctionResultText.setText(
                "UNSOLD — No bids placed."
            );

            console.log(
                "UNSOLD — No bids placed."
            );
        }

        /*
         * No automatic delay.
         * The user must press NEXT FIGHTER.
         */
        const hasNextFighter =
            this.currentFighterIndex + 1 <
            this.auctionFighters.length;

        if (hasNextFighter) {
            this.nextFighterButton.setText(
                "NEXT FIGHTER"
            );

            this.nextFighterButton.setVisible(
                true
            );
        } else {
            this.nextFighterButton.setVisible(
                false
            );

            this.auctionResultText.setText(
                `${this.auctionResultText.text} — AUCTION COMPLETE`
            );
        }
    }

    private startAuctionTimer(): void {
        this.stopAuctionTimer();

        this.auctionWarningText.setText(
            ""
        );

        this.auctionTimer =
            this.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => {
                    if (
                        !this.auctionStarted ||
                        this.auctionResolved
                    ) {
                        return;
                    }

                    const seconds =
                        this.auctionSystem.tickAuctionTimer();

                    if (seconds === 6) {
                        this.auctionWarningText.setText(
                            "⚠ AUCTION WARNING"
                        );

                        this.auctionWarningText.setColor(
                            "#ffff00"
                        );

                        console.log(
                            "Auction warning: 6 seconds remaining."
                        );
                    }

                    if (seconds === 3) {
                        this.auctionWarningText.setText(
                            "🚨 FINAL WARNING"
                        );

                        this.auctionWarningText.setColor(
                            "#ff0000"
                        );

                        console.log(
                            "Auction warning: 3 seconds remaining."
                        );
                    }

                    if (
                        this.auctionSystem.isAuctionExpired()
                    ) {
                        const outcome =
                            this.auctionSystem.getAuctionOutcome();

                        if (
                            outcome ===
                            "SOLD"
                        ) {
                            this.resolveCurrentAuction(
                                "SOLD"
                            );
                        }

                        if (
                            outcome ===
                            "UNSOLD"
                        ) {
                            this.resolveCurrentAuction(
                                "UNSOLD"
                            );
                        }
                    }
                },
            });
    }
}