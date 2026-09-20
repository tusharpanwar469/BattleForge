import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GAME_BACKGROUND,
} from "./config/gameConfig";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game",
  backgroundColor: GAME_BACKGROUND,
  scene: [BootScene, MenuScene],
};

new Phaser.Game(config);