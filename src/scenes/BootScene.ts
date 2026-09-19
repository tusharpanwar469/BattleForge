import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.add.text(640, 360, "BATTLEFORGE", {
      fontSize: "64px",
      color: "#ffffff",
    }).setOrigin(0.5);
  }
}
