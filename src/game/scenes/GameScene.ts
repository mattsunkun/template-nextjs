import { Scene } from 'phaser';

import { GameClient, tRule } from '../clients/GameClient';
import { PhaseManager } from '../managers/PhaseManager';
import { _allPairCount, _teams } from '../servers/MockServer';

export class GameScene extends Scene
{

    private camera: Phaser.Cameras.Scene2D.Camera;

    private phaseManager: PhaseManager;

    private gameClient: GameClient;
    private rule: tRule;

    constructor()
    {
        super('GameScene');
    }

    async init(gameClient: GameClient, rule: tRule) {
        this.gameClient = gameClient;
    }

    preload(){
        for (const team of _teams) {
            this.load.image(`card_back/${team}/`, `assets/card_back/${team}.png`);
            for (let i = 0; i <= _allPairCount; i++) {
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
