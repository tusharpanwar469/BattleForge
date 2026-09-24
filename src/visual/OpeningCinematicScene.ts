import Phaser from "phaser";

export class OpeningCinematicScene extends Phaser.Scene {
    constructor() {
        super("OpeningCinematicScene");
    }

    create() {
        const { width, height } = this.scale;
        // Cinematic vignette
const vignette = this.add.rectangle(
    width / 2,
    height / 2,
    width,
    height,
    0x000000,
    0
);

vignette.setDepth(10);

this.tweens.add({
    targets: vignette,
    alpha: 0.12,
    duration: 1200,
    ease: "Sine.easeInOut"
});
        // Cinematic sequence helper
const sequence = async (
    action: () => void,
    delay: number
) => {
    action();

    await new Promise<void>((resolve) => {
        this.time.delayedCall(delay, resolve);
    });
};

        // Opening cinematic background
        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x05070d
        );

        // Cinematic title
const title = this.add.text(
    width / 2,
    height * 0.42,
    "BATTLE FORGE",
    {
        fontSize: "56px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

title.setAlpha(0);
title.setScale(0.85);

this.tweens.add({
    targets: title,
    alpha: 1,
    scale: 1,
    duration: 1200,
    ease: "Sine.easeOut",
    hold: 1200,
    yoyo: true
});
// Cinematic transition
const fade = this.add.rectangle(
    width / 2,
    height / 2,
    width,
    height,
    0x000000,
    0
);

fade.setDepth(20);

this.tweens.add({
    targets: fade,
    alpha: 1,
    duration: 1000,
    delay: 2400,
    ease: "Sine.easeInOut",
    hold: 500,
    yoyo: true
});
// Wide shot
const wideShot = this.add.rectangle(
    width / 2,
    height / 2,
    width,
    height,
    0x111827,
    1
);

wideShot.setDepth(0);
wideShot.setAlpha(0);
// Wide shot background motion
this.tweens.add({
    targets: wideShot,
    x: width / 2 + 20,
    duration: 6000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// Wide shot atmosphere
const atmosphere = this.add.rectangle(
    width / 2,
    height * 0.35,
    width,
    height * 0.7,
    0x6b7280,
    0.35
);

atmosphere.setDepth(1);

this.tweens.add({
    targets: atmosphere,
    alpha: 0.55,
    duration: 1200,
    delay: 3600,
    ease: "Sine.easeInOut"
});
// Team A reveal
const teamAText = this.add.text(
    width * 0.25,
    height * 0.55,
    "TEAM A",
    {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

teamAText.setAlpha(0);
teamAText.setScale(0.8);
teamAText.setDepth(5);
// Team A reveal glow
const teamAGlow = this.add.circle(
    width * 0.25,
    height * 0.55,
    55,
    0xffffff,
    0.18
);

teamAGlow.setDepth(2);
teamAGlow.setScale(0);

this.tweens.add({
    targets: teamAGlow,
    scale: 1,
    alpha: 0.28,
    duration: 900,
    ease: "Sine.easeOut"
});


this.tweens.add({
    targets: teamAText,
    alpha: 1,
    scale: 1,
    duration: 900,
    ease: "Back.easeOut"
});
// Team A glow pulse
this.tweens.add({
    targets: teamAGlow,
    scale: 1.08,
    alpha: 0.2,
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// Team B reveal
const teamBText = this.add.text(
    width * 0.75,
    height * 0.55,
    "TEAM B",
    {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

teamBText.setAlpha(0);
teamBText.setScale(0.8);
teamBText.setDepth(5);
// Team B reveal glow
const teamBGlow = this.add.circle(
    width * 0.75,
    height * 0.55,
    55,
    0xffffff,
    0.18
);

teamBGlow.setDepth(2);
teamBGlow.setScale(0);

this.tweens.add({
    targets: teamBGlow,
    scale: 1,
    alpha: 0.28,
    duration: 900,
    delay: 900,
    ease: "Sine.easeOut"
});
// Team B glow pulse
    this.tweens.add({
        targets: teamBGlow,
        scale: 1.08,
        alpha: 0.2,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
    });
// Cinematic center divider
const centerDivider = this.add.rectangle(
    width / 2,
    height * 0.55,
    220,
    2,
    0xffffff,
    0.18
);

centerDivider.setDepth(5);
centerDivider.setScale(0, 1);

this.time.delayedCall(1800, () => {
    this.tweens.add({
        targets: centerDivider,
        scaleX: 1,
        alpha: 0.35,
        duration: 700,
        ease: "Sine.easeOut"
    });
});
this.time.delayedCall(3000, () => {
    this.tweens.add({
        targets: centerDivider,
        alpha: 0,
        duration: 500,
        ease: "Sine.easeInOut"
    });
});
// Cinematic VS marker
const versusText = this.add.text(
    width / 2,
    height * 0.55,
    "VS",
    {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

versusText.setDepth(6);
versusText.setAlpha(0);
versusText.setScale(0.6);

this.time.delayedCall(1800, () => {
    this.tweens.add({
        targets: versusText,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: "Back.easeOut"
    });
});
// VS pulse
this.tweens.add({
    targets: versusText,
    scale: 1.08,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});
// VS fade before camera push
this.time.delayedCall(3000, () => {
    this.tweens.add({
        targets: versusText,
        alpha: 0,
        scale: 0.8,
        duration: 500,
        ease: "Sine.easeInOut"
    });
});
// Cinematic center focus
const centerFocus = this.add.circle(
    width / 2,
    height * 0.55,
    8,
    0xffffff,
    0.18
);

centerFocus.setDepth(2);
centerFocus.setScale(0);
centerFocus.setAlpha(0);

this.tweens.add({
    targets: centerFocus,
    scale: 2,
    alpha: 0.35,
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
});

this.time.delayedCall(900, () => {
    this.tweens.add({
        targets: teamBText,
        alpha: 1,
        scale: 1,
        duration: 900,
        ease: "Back.easeOut"
    });
});
// Camera push-in
const camera = this.cameras.main;
// VS fade before camera push
this.time.delayedCall(3000, () => {
    this.tweens.add({
        targets: versusText,
        alpha: 0,
        scale: 0.8,
        duration: 500,
        ease: "Sine.easeInOut"
    });
});

this.time.delayedCall(1800, () => {
    this.tweens.add({
        targets: camera,
        zoom: 1.02,
        duration: 2200,
        ease: "Sine.easeInOut"
    });
});
// Let's Fight title
const fightText = this.add.text(
    width / 2,
    height * 0.78,
    "LET'S FIGHT",
    {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
    }
).setOrigin(0.5);

fightText.setAlpha(0);
fightText.setScale(1);
fightText.setDepth(100);
this.time.delayedCall(4000, () => {
    this.tweens.add({
        targets: fightText,
        alpha: 1,
        scale: 1.08,
        duration: 500,
        ease: "Back.easeOut"
    });
    // LET'S FIGHT settle
this.time.delayedCall(4500, () => {
    this.tweens.add({
        targets: fightText,
        scale: 1,
        duration: 350,
        ease: "Sine.easeOut"
    });
});
    // Cinematic transition fade
const transitionFade = this.add.rectangle(
    width / 2,
    height / 2,
    width,
    height,
    0x000000,
    0
);

transitionFade.setDepth(150);

this.time.delayedCall(5000, () => {
    this.tweens.add({
        targets: transitionFade,
        alpha: 1,
        duration: 900,
        ease: "Sine.easeInOut"
    });
});
});
const fightImpact = this.add.circle(
    width / 2,
    height * 0.78,
    12,
    0xffffff,
    0.35
);

fightImpact.setDepth(99);
fightImpact.setScale(0);

this.time.delayedCall(4000, () => {
    this.tweens.add({
        targets: fightImpact,
        scale: 5,
        alpha: 0,
        duration: 700,
        ease: "Cubic.easeOut"
    });
});

this.tweens.add({
    targets: wideShot,
    alpha: 1,
    duration: 1400,
    delay: 3600,
    ease: "Sine.easeInOut"
});
    }
}