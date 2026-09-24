import Phaser from "phaser";

export class VisualLabScene extends Phaser.Scene {
    constructor() {
        super("VisualLabScene");
    }

    create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Base background layer
    this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x080b14
    );

    // Atmosphere layer
    const atmosphereLayer = this.add.rectangle(
        width / 2,
        height * 0.35,
        width,
        height * 0.7,
        0x111a2e,
        0.65
    );
    this.tweens.add({
    targets: atmosphereLayer,
    x: width / 2 + 20,
    duration: 4000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

    // Battlefield layer
    const battlefieldLayer = this.add.rectangle(
        width / 2,
        height * 0.72,
        width * 0.92,
        height * 0.28,
        0x171b24
    );
    this.tweens.add({
    targets: battlefieldLayer,
    x: width / 2 - 10,
    duration: 5000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

    // Battlefield horizon line
const horizonLayer = this.add.rectangle(
    width / 2,
    height * 0.58,
    width * 0.92,
    3,
    0x394154
);
this.tweens.add({
    targets: horizonLayer,
    x: width / 2 + 5,
    duration: 6000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
    // Parallax test layers
const farLayer = this.add.rectangle(
    width / 2,
    height * 0.30,
    width * 0.85,
    height * 0.20,
    0x202b45,
    0.45
);
this.tweens.add({
    targets: farLayer,
    x: width / 2 - 6,
    duration: 7000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

const nearLayer = this.add.rectangle(
    width / 2,
    height * 0.68,
    width * 0.75,
    height * 0.18,
    0x4a3048,
    0.55
);

// Far layer moves slowly
this.tweens.add({
    targets: farLayer,
    x: width / 2 + 35,
    duration: 7000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

// Near layer moves faster
this.tweens.add({
    targets: nearLayer,
    x: width / 2 + 80,
    duration: 3500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// Poster Animation Test
const poster = this.add.rectangle(
    width / 2,
    height * 0.68 + 80,
    180,
    240,
    0x202020,
    1
);
this.tweens.add({
    targets: poster,
    alpha: 0.9,
    scale: 1.03,
    duration: 1400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// Poster glow test
const glow = this.add.rectangle(
    width / 2,
    height * 0.68,
    200,
    260,
    0x4da6ff,
    0.12
);

glow.setOrigin(0.5);
glow.setDepth(-1);

this.tweens.add({
    targets: glow,
    alpha: 0.22,
    scale: 1.08,
    duration: 1600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// Typography test
const title = this.add.text(
    width / 2,
    height * 0.18,
    "BATTLE FORGE",
    {
        fontSize: "52px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

title.setAlpha(0);
title.setScale(0.8);

this.tweens.add({
    targets: title,
    alpha: 1,
    scale: 1,
    duration: 900,
    ease: "Back.easeOut"
});
// Particle test
for (let i = 0; i < 18; i++) {
    const particle = this.add.circle(
        width / 2 + Phaser.Math.Between(-120, 120),
        height * 0.65 + Phaser.Math.Between(-40, 40),
        Phaser.Math.Between(2, 5),
        0xffcc66,
        0.8
    );

    this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 120),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(1000, 1800),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
        ease: "Sine.easeOut"
    });
}
// Impact test
const impact = this.add.circle(
    width / 2,
    height * 0.68,
    20,
    0xffffff,
    0.9
);

impact.setScale(0);

this.tweens.add({
    targets: impact,
    scale: 4,
    alpha: 0,
    duration: 700,
    repeat: -1,
    ease: "Cubic.easeOut"
});
// Fall test
const fallPoster = this.add.rectangle(
    width * 0.72,
    height * 0.68,
    140,
    190,
    0x303030,
    1
);

fallPoster.setOrigin(0.5);

this.tweens.add({
    targets: fallPoster,
    angle: 90,
    y: height * 0.78,
    alpha: 0.25,
    duration: 900,
    delay: 1200,
    repeat: -1,
    repeatDelay: 1200,
    ease: "Cubic.easeIn"
});
// Performance test
const fpsText = this.add.text(
    20,
    20,
    "FPS: 0",
    {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: {
            x: 8,
            y: 5
        }
    }
);

fpsText.setDepth(100);

this.time.addEvent({
    delay: 500,
    loop: true,
    callback: () => {
        fpsText.setText(
            `FPS: ${Math.round(this.game.loop.actualFps)}`
        );
    }
});

poster.setOrigin(0.5);

const posterLabel = this.add.text(
    width / 2,
    height * 0.68 + 80,
    "FIGHTER",
    {
        fontSize: "24px",
        color: "#ffffff",
        align: "center"
    }
).setOrigin(0.5);
poster.setAlpha(0);
posterLabel.setAlpha(0);

this.tweens.add({
    targets: [poster, posterLabel],
    y: height * 0.68,
    alpha: 1,
    scale: 1.05,
    duration: 900,
    ease: "Back.easeOut"
});
// Camera test — controlled push-in and pull-out
const camera = this.cameras.main;

this.tweens.add({
    targets: camera,
    zoom: 1.08,
    duration: 2500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

// Visual Lab label
    this.add.text(
        width / 2,
        55,
        "BATTLE FORGE — VISUAL LAB",
        {
            fontSize: "32px",
            color: "#ffffff",
            align: "center"
        }
    ).setOrigin(0.5);
}
}