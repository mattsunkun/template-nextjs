import { Scene } from 'phaser';

import { GameClient } from '../clients/GameClient';
import { PhaseManager } from '../managers/PhaseManager';
export const teams = ["spade", "heart"];

export class GameScene extends Scene
{
    private numAllPair: number = 10;

    private camera: Phaser.Cameras.Scene2D.Camera;

    private phaseManager: PhaseManager;

    private gameClient: GameClient;

    constructor()
    {
        super('GameScene');
    }

    async init(gameClient: GameClient) {
        this.gameClient = gameClient;

    }

    preload(){
        for (const team of teams) {
            this.load.image(`card_back/${team}/`, `assets/card_back/${team}.png`);
            for (let i = 0; i <= this.numAllPair; i++) {
              this.load.image(`card_front/${team}/${i}`, `assets/card_front/${team}/${i}.png`);
            }
        }
    }

    async create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.phaseManager = new PhaseManager(this, this.gameClient);
        await this.phaseManager.create();
    }
}
