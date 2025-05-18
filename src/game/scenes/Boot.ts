// import { loadCardAssetsByType } from '@/utils/functions';
import { Scene } from 'phaser';
// import { eAssetFolderType, myMemoryCardInfos, mySpellCardInfos, opponentMemoryCardInfos, opponentSpellCardInfos } from '../servers/LocalServer';
export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        // this.load.image('background', 'assets/bg.png');


        // メモリーカードの画像を読み込む
        // [...myMemoryCardInfos, ...opponentMemoryCardInfos].forEach(cardInfo => {
        //     // 表面画像
        //     loadCardAssetsByType(this, eAssetFolderType.FRONT, [cardInfo.front]);
        //     // 裏面画像
        //     loadCardAssetsByType(this, eAssetFolderType.BACK, [cardInfo.back]);
        //     // 実物画像
        //     loadCardAssetsByType(this, eAssetFolderType.REAL, [cardInfo.real]);
        // });

        // // スペルカードの画像を読み込む
        // [...mySpellCardInfos, ...opponentSpellCardInfos].forEach(cardInfo => {
        //     // 表面画像
        //     loadCardAssetsByType(this, eAssetFolderType.FRONT, [cardInfo.front]);
        //     // 裏面画像
        //     loadCardAssetsByType(this, eAssetFolderType.BACK, [cardInfo.back]);
        //     // 実物画像
        //     loadCardAssetsByType(this, eAssetFolderType.REAL, [cardInfo.real]);
        // });
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
