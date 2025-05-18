import { eAssetFolderType } from '@/game/servers/LocalServer';
import { v4 as uuidv4 } from 'uuid';

export const generateStringUuid = (): string => {
  return uuidv4();
};


export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


export const unexpectError = (message: string) => {
    console.warn(message);
    debugger;
  throw new Error(message);
};


export const loadCardAssets = (scene: Phaser.Scene) => {
    // カードの裏面を読み込む
    scene.load.image('card-back-normal', 'assets/card/back/normal/card_back.png');
    scene.load.image('card-back-null', 'assets/card/back/null/card_back.png');

    // カードの表面の各要素を読み込む
    const cardTypes = ['attack', 'defence', 'cost', 'shuffle', 'scan', 'null'];
    cardTypes.forEach(type => {
        scene.load.image(`card-front-${type}`, `assets/card/front/${type}/card_front.png`);
    });

    // カードの実物画像を読み込む（存在する場合）
    scene.load.image('card-real', 'assets/card/real/card_real.png');
}

export const getLoadKey = (folderType: eAssetFolderType, fileName: string): string => {
    return `${folderType}-${fileName}`;
}

// 既にロードした画像を管理するSet
const loadedImages = new Set<string>();

export const loadCardAssetsByType = (scene: Phaser.Scene, folderType: eAssetFolderType, fileNames: string[]): void => {
    fileNames.forEach(fileName => {
        const loadKey = getLoadKey(folderType, fileName);
        
        // 既にロード済みの場合はスキップ
        if (loadedImages.has(loadKey)) {
            return;
        }
        const fileType = fileName.split('.')[0];
        const loadPath = `assets/card/${folderType}/${fileType}/${fileName}.png`;
        
        // 直接Phaserのローダーを使用
        scene.load.image(loadKey, loadPath);
        loadedImages.add(loadKey);
    });
}
