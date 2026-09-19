import Phaser from "phaser";

class BootScene extends Phaser.Scene {
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

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game",
  backgroundColor: "#111111",
  scene: BootScene,
};

new Phaser.Game(config);