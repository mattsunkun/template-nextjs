import { TurnManager } from "./TurnManager";

export class CSSPhaseManager {
    private scene: Phaser.Scene;
    private turnManager: TurnManager;

    constructor(scene: Phaser.Scene, turnManager: TurnManager) {
        this.scene = scene;
        this.turnManager = turnManager;
    }

    create() {
    }
}
