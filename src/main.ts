import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GAME_BACKGROUND,
} from "./config/gameConfig";
import { BootScene } from "./scenes/BootScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game",
  backgroundColor: GAME_BACKGROUND,
  scene: BootScene,
};

new Phaser.Game(config);