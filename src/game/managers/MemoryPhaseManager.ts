import { Table } from "../components/Table";
import { tCard } from "../scenes/GameScene";


enum eCardStatus {
    SELECTED,
    NOT_SELECTED,
    MATCHED,
}

export type tMemoryCard = {
    card: tCard;
    status: eCardStatus;
}

export class MemoryPhaseManager {
    private scene: Phaser.Scene;
    private memoryCards: tMemoryCard[];
    private table: Table;

    private pairNum = 3;
    private selectedCardId: string[] = [];


    constructor(scene: Phaser.Scene, cards:tCard[]){
        this.scene = scene;
        // this.table = new Table(scene);
        // カードの状態を初期化
        this.memoryCards = cards.map((card: tCard) => ({
            card: card,
            status: eCardStatus.NOT_SELECTED
        }));

        // 画面中央に盤面を配置
        const margin = 15;
        const screenWidth = scene.scale.width;
        const screenHeight = scene.scale.height;
        const tableWidth = 700;
        const tableHeight = 400;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = (screenHeight - tableHeight) / 2 + 50; // 上部に余白を設ける

        this.table = new Table(scene, cards, tableX, tableY, tableWidth, tableHeight, margin);
    }


    
}
