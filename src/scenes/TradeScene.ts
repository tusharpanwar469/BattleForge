import Phaser from "phaser";
import { FighterRegistry } from "../systems/FighterRegistry";
import { TeamRosterManager } from "../systems/TeamRosterManager";
import {
    TradeManager,
    type TradeRequest,
} from "../systems/TradeManager";
import { TeamManager } from "../systems/TeamManager";
import type { TeamState } from "../core/TeamState";
import { BATTLEFORGE_CHARACTERS } from "../data/BattleForgeCharacters";

export class TradeScene extends Phaser.Scene {
    private teamManager!: TeamManager;
    private fighterRegistry!: FighterRegistry;
    private rosterManager!: TeamRosterManager;
    private tradeManager!: TradeManager;

    private teams: TeamState[] = [];

    private teamASelect!: HTMLSelectElement;
    private fighterASelect!: HTMLSelectElement;

    private teamBSelect!: HTMLSelectElement;
    private fighterBSelect!: HTMLSelectElement;

    private teamAConfirmed = false;
    private teamBConfirmed = false;

    private statusText!: Phaser.GameObjects.Text;
    private confirmAText!: Phaser.GameObjects.Text;
    private confirmBText!: Phaser.GameObjects.Text;
    private executeButton!: Phaser.GameObjects.Text;

    constructor() {
        super("TradeScene");
    }

    create(): void {
        // --------------------------------------------------
        // TEAM MANAGER
        // --------------------------------------------------

        this.teamManager =
            this.game.registry.get("teamManager");

        if (!this.teamManager) {
            throw new Error(
                "TeamManager not found."
            );
        }

        this.teams =
            this.teamManager.getTeams();

        if (this.teams.length !== 4) {
            throw new Error(
                "BattleForge requires exactly 4 teams."
            );
        }

        // --------------------------------------------------
        // FIGHTER REGISTRY
        // --------------------------------------------------

        this.fighterRegistry =
            new FighterRegistry();

        for (
            const fighter of BATTLEFORGE_CHARACTERS
        ) {
            this.fighterRegistry.register(
                fighter
            );
        }

        if (
            this.fighterRegistry.size !== 80
        ) {
            throw new Error(
                `Expected 80 registered fighters, found ${this.fighterRegistry.size}.`
            );
        }

        // --------------------------------------------------
        // ROSTER + TRADE MANAGER
        // --------------------------------------------------

        this.rosterManager =
            new TeamRosterManager(
                this.fighterRegistry
            );

        this.tradeManager =
            new TradeManager(
                this.fighterRegistry,
                this.rosterManager
            );

        // --------------------------------------------------
        // TITLE
        // --------------------------------------------------

        this.add.text(
            640,
            50,
            "TRADE PHASE",
            {
                fontSize: "48px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.add.text(
            640,
            105,
            "Both teams must agree before the trade is executed.",
            {
                fontSize: "20px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // TEAM A
        // --------------------------------------------------

        this.add.text(
            320,
            170,
            "TEAM A",
            {
                fontSize: "28px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.teamASelect =
            this.createSelect(
                170,
                215
            );

        this.fighterASelect =
            this.createSelect(
                170,
                275
            );

        this.add.text(
            170,
            320,
            "FIGHTER OFFERED",
            {
                fontSize: "18px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // TEAM B
        // --------------------------------------------------

        this.add.text(
            960,
            170,
            "TEAM B",
            {
                fontSize: "28px",
                color: "#ffffff",
            }
        ).setOrigin(0.5);

        this.teamBSelect =
            this.createSelect(
                960,
                215
            );

        this.fighterBSelect =
            this.createSelect(
                960,
                275
            );

        this.add.text(
            960,
            320,
            "FIGHTER OFFERED",
            {
                fontSize: "18px",
                color: "#aaaaaa",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // TRADE ARROW
        // --------------------------------------------------

        this.add.text(
            640,
            245,
            "⇄",
            {
                fontSize: "64px",
                color: "#ffff00",
            }
        ).setOrigin(0.5);

        // --------------------------------------------------
        // CONFIRM TEAM A
        // --------------------------------------------------

        this.confirmAText =
            this.createButton(
                320,
                390,
                "TEAM A: CONFIRM"
            );

        this.confirmAText.on(
            "pointerdown",
            () => {
                this.teamAConfirmed =
                    !this.teamAConfirmed;

                this.updateConfirmationButtons();
                this.updateStatus();
            }
        );

        // --------------------------------------------------
        // CONFIRM TEAM B
        // --------------------------------------------------

        this.confirmBText =
            this.createButton(
                960,
                390,
                "TEAM B: CONFIRM"
            );

        this.confirmBText.on(
            "pointerdown",
            () => {
                this.teamBConfirmed =
                    !this.teamBConfirmed;

                this.updateConfirmationButtons();
                this.updateStatus();
            }
        );

        // --------------------------------------------------
        // EXECUTE TRADE
        // --------------------------------------------------

        this.executeButton =
            this.createButton(
                640,
                500,
                "EXECUTE TRADE"
            );

        this.executeButton.on(
            "pointerdown",
            () => {
                this.executeTrade();
            }
        );

        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        this.statusText =
            this.add.text(
                640,
                575,
                "Select two teams and their fighters.",
                {
                    fontSize: "22px",
                    color: "#ffffff",
                    align: "center",
                    wordWrap: {
                        width: 900,
                    },
                }
            ).setOrigin(0.5);

        // --------------------------------------------------
        // TEAM SELECT EVENTS
        // --------------------------------------------------

        this.teamASelect.addEventListener(
            "change",
            () => {
                this.resetConfirmations();

                this.updateFighterSelect(
                    this.teamASelect,
                    this.fighterASelect
                );

                this.updateStatus();
            }
        );

        this.teamBSelect.addEventListener(
            "change",
            () => {
                this.resetConfirmations();

                this.updateFighterSelect(
                    this.teamBSelect,
                    this.fighterBSelect
                );

                this.updateStatus();
            }
        );

        this.fighterASelect.addEventListener(
            "change",
            () => {
                this.resetConfirmations();
                this.updateStatus();
            }
        );

        this.fighterBSelect.addEventListener(
            "change",
            () => {
                this.resetConfirmations();
                this.updateStatus();
            }
        );

        // --------------------------------------------------
        // INITIAL OPTIONS
        // --------------------------------------------------

        this.populateTeamSelect(
            this.teamASelect
        );

        this.populateTeamSelect(
            this.teamBSelect
        );

        if (this.teams.length >= 2) {
            this.teamASelect.value =
                this.teams[0].id;

            this.teamBSelect.value =
                this.teams[1].id;
        }

        this.updateFighterSelect(
            this.teamASelect,
            this.fighterASelect
        );

        this.updateFighterSelect(
            this.teamBSelect,
            this.fighterBSelect
        );

        this.updateConfirmationButtons();
        this.updateStatus();
    }

    // --------------------------------------------------
    // CREATE HTML SELECT
    // --------------------------------------------------

    private createSelect(
        x: number,
        y: number
    ): HTMLSelectElement {
        const select =
            document.createElement(
                "select"
            );

        select.style.position =
            "absolute";

        select.style.left =
            `${x - 150}px`;

        select.style.top =
            `${y - 20}px`;

        select.style.width =
            "300px";

        select.style.height =
            "42px";

        select.style.fontSize =
            "18px";

        select.style.padding =
            "5px 10px";

        select.style.zIndex =
            "1000";

        document.body.appendChild(
            select
        );

        return select;
    }

    // --------------------------------------------------
    // CREATE PHASER BUTTON
    // --------------------------------------------------

    private createButton(
        x: number,
        y: number,
        text: string
    ): Phaser.GameObjects.Text {
        const button =
            this.add.text(
                x,
                y,
                text,
                {
                    fontSize: "22px",
                    color: "#ffffff",
                    backgroundColor: "#333333",
                    padding: {
                        x: 20,
                        y: 10,
                    },
                }
            ).setOrigin(0.5);

        button.setInteractive({
            useHandCursor: true,
        });

        button.on(
            "pointerover",
            () => {
                button.setStyle({
                    color: "#ffff00",
                });
            }
        );

        button.on(
            "pointerout",
            () => {
                button.setStyle({
                    color: "#ffffff",
                });
            }
        );

        return button;
    }

    // --------------------------------------------------
    // TEAM OPTIONS
    // --------------------------------------------------

    private populateTeamSelect(
        select: HTMLSelectElement
    ): void {
        select.innerHTML = "";

        this.teams.forEach(
            (team) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    team.id;

                option.textContent =
                    team.name;

                select.appendChild(
                    option
                );
            }
        );
    }

    // --------------------------------------------------
    // FIGHTER OPTIONS
    // --------------------------------------------------

    private updateFighterSelect(
        teamSelect: HTMLSelectElement,
        fighterSelect: HTMLSelectElement
    ): void {
        const team =
            this.teams.find(
                (state) =>
                    state.id ===
                    teamSelect.value
            );

        fighterSelect.innerHTML = "";

        if (!team) {
            return;
        }

        team.roster.forEach(
            (fighterId) => {
                const fighter =
                    this.fighterRegistry.getById(
                        fighterId
                    );

                if (!fighter) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    fighter.id;

                option.textContent =
                    fighter.name;

                fighterSelect.appendChild(
                    option
                );
            }
        );
    }

    // --------------------------------------------------
    // GET TEAM
    // --------------------------------------------------

    private getSelectedTeam(
        select: HTMLSelectElement
    ): TeamState | undefined {
        return this.teams.find(
            (team) =>
                team.id ===
                select.value
        );
    }

    // --------------------------------------------------
    // RESET CONFIRMATIONS
    // --------------------------------------------------

    private resetConfirmations(): void {
        this.teamAConfirmed =
            false;

        this.teamBConfirmed =
            false;

        this.updateConfirmationButtons();
    }

    // --------------------------------------------------
    // CONFIRMATION UI
    // --------------------------------------------------

    private updateConfirmationButtons(): void {
        this.confirmAText.setText(
            this.teamAConfirmed
                ? "TEAM A: CONFIRMED ✓"
                : "TEAM A: CONFIRM"
        );

        this.confirmBText.setText(
            this.teamBConfirmed
                ? "TEAM B: CONFIRMED ✓"
                : "TEAM B: CONFIRM"
        );
    }

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    private updateStatus(): void {
        const teamA =
            this.getSelectedTeam(
                this.teamASelect
            );

        const teamB =
            this.getSelectedTeam(
                this.teamBSelect
            );

        if (!teamA || !teamB) {
            this.statusText.setText(
                "Select two teams."
            );

            return;
        }

        if (
            teamA.id === teamB.id
        ) {
            this.statusText.setText(
                "A team cannot trade with itself."
            );

            return;
        }

        if (
            teamA.roster.length === 0 ||
            teamB.roster.length === 0
        ) {
            this.statusText.setText(
                "Both teams must have at least one fighter."
            );

            return;
        }

        if (
            this.teamAConfirmed &&
            this.teamBConfirmed
        ) {
            this.statusText.setText(
                "Both teams confirmed. Trade is ready to execute."
            );

            return;
        }

        this.statusText.setText(
            `Team A: ${
                this.teamAConfirmed
                    ? "CONFIRMED"
                    : "WAITING"
            }    |    Team B: ${
                this.teamBConfirmed
                    ? "CONFIRMED"
                    : "WAITING"
            }`
        );
    }

    // --------------------------------------------------
    // EXECUTE TRADE
    // --------------------------------------------------

    private executeTrade(): void {
        const teamA =
            this.getSelectedTeam(
                this.teamASelect
            );

        const teamB =
            this.getSelectedTeam(
                this.teamBSelect
            );

        if (!teamA || !teamB) {
            this.statusText.setText(
                "Please select both teams."
            );

            return;
        }

        const fighterAId =
            this.fighterASelect.value;

        const fighterBId =
            this.fighterBSelect.value;

        if (!fighterAId || !fighterBId) {
            this.statusText.setText(
                "Please select one fighter from each team."
            );

            return;
        }

        const request: TradeRequest = {
            teamA,
            fighterAId,
            teamB,
            fighterBId,
            teamAConfirmed:
                this.teamAConfirmed,
            teamBConfirmed:
                this.teamBConfirmed,
        };

        const result =
            this.tradeManager.executeTrade(
                request
            );

        if (!result.success) {
            this.statusText.setText(
                `TRADE FAILED: ${
                    result.errors[0] ??
                    "Unknown trade error."
                }`
            );

            console.error(
                "Trade failed:",
                result.errors
            );

            return;
        }

        const fighterA =
            this.fighterRegistry.getById(
                fighterAId
            );

        const fighterB =
            this.fighterRegistry.getById(
                fighterBId
            );

        this.statusText.setText(
            `TRADE SUCCESSFUL: ${teamA.name} received ${
                fighterB?.name ?? fighterBId
            } and ${teamB.name} received ${
                fighterA?.name ?? fighterAId
            }.`
        );

        console.log(
    "Trade successful:",
    {
        teamA: teamA.name,
        receivedByTeamA:
            fighterB?.name ??
            fighterBId,
        teamB: teamB.name,
        receivedByTeamB:
            fighterA?.name ??
            fighterAId,
    }
    );

        this.resetConfirmations();

        this.updateFighterSelect(
            this.teamASelect,
            this.fighterASelect
        );

        this.updateFighterSelect(
            this.teamBSelect,
            this.fighterBSelect
        );
    }

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    shutdown(): void {
        this.teamASelect?.remove();
        this.fighterASelect?.remove();

        this.teamBSelect?.remove();
        this.fighterBSelect?.remove();
    }
}