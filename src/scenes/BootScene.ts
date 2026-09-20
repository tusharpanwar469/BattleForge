import Phaser from "phaser";
import { GameStateManager } from "../systems/GameStateManager";

export class BootScene extends Phaser.Scene {
    private gameStateManager: GameStateManager;

    constructor() {
        super("BootScene");
        this.gameStateManager = new GameStateManager();
    }

    create() {
    this.gameStateManager.setPhase("menu");

    this.add.text(640, 360, "BATTLEFORGE", {
        fontSize: "64px",
        color: "#ffffff",
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
        this.scene.start("MenuScene");
    });
}
}