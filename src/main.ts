import { OpeningCinematicScene } from "./visual/OpeningCinematicScene";
import { VisualLabScene } from "./visual/VisualLabScene";
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
  scene: [OpeningCinematicScene, VisualLabScene, BootScene],
};

new Phaser.Game(config);