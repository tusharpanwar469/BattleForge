import Phaser from "phaser";

export class CameraController {
    private camera: Phaser.Cameras.Scene2D.Camera;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
}

    zoomTo(
        zoom: number,
        duration: number = 1000
    ): void {
        this.camera.zoomTo(
            zoom,
            duration,
            "Sine.easeInOut"
        );
    }
    setZoom(
    zoom: number
): void {
    this.camera.setZoom(zoom);
}
    focusOn(
    x: number,
    y: number,
    duration: number = 1000
): void {
    this.camera.pan(
        x,
        y,
        duration,
        "Sine.easeInOut"
    );
}
setRotation(
    rotation: number
): void {
    this.camera.setRotation(rotation);
}
setPosition(
    x: number,
    y: number
): void {
    this.camera.centerOn(x, y);
}
rotateTo(
    rotation: number,
    duration: number = 500
): void {
    this.scene.tweens.add({
        targets: this.camera,
        rotation,
        duration,
        ease: "Sine.easeInOut"
    });
}
stop(): void {
    this.scene.tweens.killTweensOf(this.camera);
}
panTo(
    x: number,
    y: number,
    duration: number = 1000
): void {
    this.camera.pan(
        x,
        y,
        duration,
        "Sine.easeInOut"
    );
}
isMoving(): boolean {
    return this.scene.tweens.getTweensOf(this.camera).length > 0;
}
shake(
    duration: number = 300,
    intensity: number = 0.01
): void {
    this.camera.shake(
        duration,
        intensity
    );
}
fadeOut(
    duration: number = 800,
    color: number = 0x000000
): void {
    this.camera.fadeOut(duration, color);
}

fadeIn(
    duration: number = 800,
    color: number = 0x000000
): void {
    this.camera.fadeIn(duration, color);
}
flash(
    duration: number = 250,
    color: number = 0xffffff,
    intensity: number = 0.8
): void {
    this.camera.flash(
        duration,
        255,
        255,
        255,
        true
    );
}
    reset(
        duration: number = 800
    ): void {
        this.camera.zoomTo(
            1,
            duration,
            "Sine.easeInOut"
        );

        this.camera.centerOn(
    this.camera.width / 2,
    this.camera.height / 2
);
    }
}