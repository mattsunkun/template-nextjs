import { loadCardAssetsByType } from '@/utils/functions';
import { Scene } from 'phaser';
import { GameClient, tRule } from '../clients/GameClient';
import { PhaseManager } from '../managers/PhaseManager';
import { eAssetFolderType, myMemoryCardInfos, mySpellCardInfos, opponentMemoryCardInfos, opponentSpellCardInfos } from '../servers/LocalServer';

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
        // 基本的なカードアセットを読み込む

        // メモリーカードの画像を読み込む
        [...myMemoryCardInfos, ...opponentMemoryCardInfos].forEach(cardInfo => {
            // 表面画像
            loadCardAssetsByType(this, eAssetFolderType.FRONT, [cardInfo.front]);
            // 裏面画像
            loadCardAssetsByType(this, eAssetFolderType.BACK, [cardInfo.back]);
            // 実物画像
            loadCardAssetsByType(this, eAssetFolderType.REAL, [cardInfo.real]);
        });

        // スペルカードの画像を読み込む
        [...mySpellCardInfos, ...opponentSpellCardInfos].forEach(cardInfo => {
            // 表面画像
            loadCardAssetsByType(this, eAssetFolderType.FRONT, [cardInfo.front]);
            // 裏面画像
            loadCardAssetsByType(this, eAssetFolderType.BACK, [cardInfo.back]);
            // 実物画像
            loadCardAssetsByType(this, eAssetFolderType.REAL, [cardInfo.real]);
        });
    }

    async create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.phaseManager = new PhaseManager(this, this.gameClient);
        await this.phaseManager.create();
    }
}
