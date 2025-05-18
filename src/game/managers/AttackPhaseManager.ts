import { AbstractSubManager } from "./AbstractSubManager";
import { PhaseManager } from "./PhaseManager";

export class AttackPhaseManager extends AbstractSubManager {
    private scene: Phaser.Scene;
    private phaseManager: PhaseManager;

    constructor(phaseManager: PhaseManager) {
        super();

        this.scene = phaseManager.scene;
        this.phaseManager = phaseManager;
    }

    public async startPhaseAsync(): Promise<void> {
        return Promise.resolve();
    }

    public async endPhaseAsync(): Promise<void> {
        return Promise.resolve();
    }

    public updateVisualizer(): void {
        
    }
}